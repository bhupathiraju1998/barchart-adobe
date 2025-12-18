// Configuration service for dynamic flag fetching
// This service handles the two-step configuration process

export const fetchDynamicConfig = async () => {
  try {
    // Step 1: Fetch index mappings to get the URL structure
    const indexResponse = await fetch('https://configs.swiftools.com/flags/index-mappings.json');
    if (!indexResponse.ok) {
      throw new Error(`Failed to fetch index mappings: ${indexResponse.status}`);
    }
    
    const indexData = await indexResponse.json();
    
    // Step 2: Construct the full URL using base_url + project URL
    const baseUrl = indexData.base_url;
    const projectUrl = indexData.projects['adobe-express']['charts-pro'].url;
    const fullUrl = baseUrl + projectUrl;
    
    // Step 3: Fetch the actual flags from the constructed URL
    const flagsResponse = await fetch(fullUrl);
    if (!flagsResponse.ok) {
      throw new Error(`Failed to fetch flags: ${flagsResponse.status}`);
    }
    
    // Get text first to check for JSON errors
    const responseText = await flagsResponse.text();
    
    try {
      const flagsData = JSON.parse(responseText);
      return {
        success: true,
        data: flagsData,
        source: fullUrl
      };
    } catch (parseError) {
      console.error('JSON Parse Error in dynamic config:', parseError.message);
      throw new Error(`JSON parse error: ${parseError.message}. Check for comments or invalid JSON syntax in the config file.`);
    }
    
  } catch (error) {
    console.error('Dynamic config fetch failed:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Fallback function to fetch flags directly (for backward compatibility)
export const fetchFlagsDirect = async () => {
  const FLAGS_URL = "https://configs.swiftools.com/flags/projects/adobe-express/charts-pro/flags.json";
  try {
    const response = await fetch(FLAGS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch flags: ${response.status}`);
    }
    
    // Get text first to check for JSON errors
    const responseText = await response.text();
    
    try {
      const data = JSON.parse(responseText);
      return {
        success: true,
        data: data,
        source: FLAGS_URL
      };
    } catch (parseError) {
      console.error('JSON Parse Error in direct config:', parseError.message);
      throw new Error(`JSON parse error: ${parseError.message}. Check for comments or invalid JSON syntax in the config file.`);
    }
  } catch (error) {
    console.error('Direct flags fetch failed:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

