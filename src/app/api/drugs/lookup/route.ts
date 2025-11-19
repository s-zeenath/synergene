import { NextRequest, NextResponse } from "next/server";

interface DrugInfo {
  name: string;
  description?: string;
  molecularFormula?: string;
  molecularWeight?: string;
  iupacName?: string;
  canonicalSmiles?: string;
  target?: string;
  mechanism?: string;
  classification?: string;
  associatedDrugs?: string[];
  pubchemId?: string;
  chemblId?: string;
  sources: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const drugName = searchParams.get("name");

    if (!drugName) {
      return NextResponse.json({ error: "Drug name is required" }, { status: 400 });
    }

    console.log(`Searching for drug: ${drugName}`);

    // Try all APIs in parallel for better performance
    const [pubchemData, openTargetsData] = await Promise.allSettled([
      getPubchemData(drugName),
      getOpenTargetsData(drugName)
    ]);

    const pubchemResult = pubchemData.status === 'fulfilled' ? pubchemData.value : {};
    const openTargetsResult = openTargetsData.status === 'fulfilled' ? openTargetsData.value : {};

    console.log("PubChem result:", pubchemResult);
    console.log("OpenTargets result:", openTargetsResult);

    // Determine which sources provided data
    const sources: string[] = [];
    if (Object.keys(pubchemResult).length > 0) sources.push('PubChem');
    if (Object.keys(openTargetsResult).length > 0) sources.push('OpenTargets');

    // For cisplatin specifically, add manual data if APIs don't have it
    let manualData = {};
    if (drugName.toLowerCase() === 'cisplatin' && !openTargetsResult.target) {
      manualData = {
        target: "DNA",
        mechanism: "Forms DNA crosslinks that inhibit DNA replication and transcription",
        classification: "Platinum-based antineoplastic",
        associatedDrugs: ["Carboplatin", "Oxaliplatin", "Nedaplatin"]
      };
      if (!sources.includes('Manual')) sources.push('Manual');
    }

    // Merge the data with better fallback logic
    const drugInfo: DrugInfo = {
      name: drugName,
      description: pubchemResult.description || openTargetsResult.description || `Information for ${drugName}`,
      molecularFormula: pubchemResult.molecularFormula,
      molecularWeight: pubchemResult.molecularWeight,
      iupacName: pubchemResult.iupacName,
      canonicalSmiles: pubchemResult.canonicalSmiles,
      target: openTargetsResult.target || (manualData as any).target || "Information not available",
      mechanism: openTargetsResult.mechanism || (manualData as any).mechanism || "Information not available",
      classification: openTargetsResult.classification || (manualData as any).classification,
      associatedDrugs: openTargetsResult.associatedDrugs || (manualData as any).associatedDrugs,
      pubchemId: pubchemResult.pubchemId,
      chemblId: openTargetsResult.chemblId,
      sources
    };

    console.log("Final drug info:", JSON.stringify(drugInfo, null, 2));

    return NextResponse.json({ 
      success: true, 
      drug: drugInfo 
    });

  } catch (error) {
    console.error("Drug lookup error:", error);
    return NextResponse.json({ 
      error: "Internal server error while searching for drug information" 
    }, { status: 500 });
  }
}

async function getPubchemData(drugName: string): Promise<Partial<DrugInfo>> {
  try {
    console.log(`Searching PubChem for: ${drugName}`);
    
    const searchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(drugName)}/cids/JSON`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      console.log(`PubChem search failed with status: ${searchResponse.status}`);
      return {};
    }
    
    const searchData = await searchResponse.json();
    if (!searchData.IdentifierList?.CID?.length) {
      console.log(`No CID found in PubChem for: ${drugName}`);
      return {};
    }

    const cid = searchData.IdentifierList.CID[0];
    console.log(`Found PubChem CID: ${cid}`);

    // Get properties from PubChem
    const propertiesUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES,Title/JSON`;
    const propertiesResponse = await fetch(propertiesUrl);
    
    if (!propertiesResponse.ok) {
      console.log(`PubChem properties API failed for CID ${cid}`);
      return {};
    }

    const propertiesData = await propertiesResponse.json();
    const propertyList = propertiesData.PropertyTable?.Properties?.[0];

    if (!propertyList) {
      return {};
    }

    return {
      description: propertyList.Title ? `${propertyList.Title} (PubChem CID ${cid})` : `${drugName} (PubChem CID ${cid})`,
      molecularFormula: propertyList.MolecularFormula,
      molecularWeight: propertyList.MolecularWeight?.toString(),
      iupacName: propertyList.IUPACName,
      canonicalSmiles: propertyList.CanonicalSMILES,
      pubchemId: cid.toString()
    };
  } catch (error) {
    console.error("PubChem error:", error);
    return {};
  }
}

async function getOpenTargetsData(drugName: string): Promise<Partial<DrugInfo>> {
  try {
    console.log(`Searching OpenTargets for: ${drugName}`);
    
    // First search for the drug by name
    const searchQuery = {
      query: `
        query SearchDrug($query: String!) {
          search(queryString: $query, entityType: DRUG, size: 10) {
            hits {
              id
              name
              synonyms
            }
          }
        }
      `,
      variables: {
        query: drugName
      }
    };

    const searchResponse = await fetch('https://api.platform.opentargets.org/api/v4/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchQuery)
    });

    if (!searchResponse.ok) {
      console.log(`OpenTargets search failed with status: ${searchResponse.status}`);
      return {};
    }

    const searchData = await searchResponse.json();
    console.log("OpenTargets search response:", JSON.stringify(searchData, null, 2));
    
    if (!searchData.data?.search?.hits?.length) {
      console.log(`No drugs found in OpenTargets for: ${drugName}`);
      return {};
    }

    // Find the best match
    const drugHit = searchData.data.search.hits[0];
    const chemblId = drugHit.id;
    console.log(`Found OpenTargets drug: ${drugHit.name} (${chemblId})`);

    // Now get detailed drug information with multiple queries
    const drugQueries = [
      // Basic drug info
      {
        query: `
          query GetDrugInfo($chemblId: String!) {
            drug(chemblId: $chemblId) {
              id
              name
              description
              drugType
              maximumClinicalTrialPhase
              mechanismsOfAction {
                actionType
                mechanismOfAction
                target {
                  id
                  approvedSymbol
                  approvedName
                }
              }
            }
          }
        `,
        variables: { chemblId }
      },
      // Related drugs
      {
        query: `
          query GetRelatedDrugs($chemblId: String!) {
            drug(chemblId: $chemblId) {
              relatedDrugs {
                id
                name
              }
            }
          }
        `,
        variables: { chemblId }
      }
    ];

    const [drugResponse, relatedResponse] = await Promise.allSettled(
      drugQueries.map(query => 
        fetch('https://api.platform.opentargets.org/api/v4/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(query)
        })
      )
    );

    let drugDetails: any = {};
    let relatedDrugs: any[] = [];

    if (drugResponse.status === 'fulfilled' && drugResponse.value.ok) {
      const drugData = await drugResponse.value.json();
      console.log("OpenTargets drug details:", JSON.stringify(drugData, null, 2));
      drugDetails = drugData.data?.drug || {};
    }

    if (relatedResponse.status === 'fulfilled' && relatedResponse.value.ok) {
      const relatedData = await relatedResponse.value.json();
      relatedDrugs = relatedData.data?.drug?.relatedDrugs || [];
    }

    // Extract targets and mechanisms
    const mechanisms = drugDetails.mechanismsOfAction || [];
    const targets: string[] = [];
    const mechanismsList: string[] = [];

    mechanisms.forEach((moa: any) => {
      if (moa.target?.approvedName) {
        targets.push(moa.target.approvedName);
      }
      if (moa.mechanismOfAction) {
        mechanismsList.push(moa.mechanismOfAction);
      } else if (moa.actionType) {
        mechanismsList.push(moa.actionType);
      }
    });

    // Extract related drugs
    const associatedDrugs = relatedDrugs.map((drug: any) => drug.name);

    // Build classification
    let classification = "";
    if (drugDetails.maximumClinicalTrialPhase !== null && drugDetails.maximumClinicalTrialPhase !== undefined) {
      classification = `Phase ${drugDetails.maximumClinicalTrialPhase}`;
    }
    if (drugDetails.drugType) {
      classification = classification ? `${classification} • ${drugDetails.drugType}` : drugDetails.drugType;
    }

    return {
      description: drugDetails.description || `${drugDetails.name || drugName} (${chemblId})`,
      target: targets.length > 0 ? targets.join(', ') : undefined,
      mechanism: mechanismsList.length > 0 ? mechanismsList.join('; ') : undefined,
      classification: classification || undefined,
      associatedDrugs: associatedDrugs.length > 0 ? associatedDrugs : undefined,
      chemblId: chemblId
    };

  } catch (error) {
    console.error("OpenTargets error:", error);
    return {};
  }
}