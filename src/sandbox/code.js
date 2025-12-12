import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor, viewport } from "express-document-sdk";

const { runtime } = addOnSandboxSdk.instance;

function start() {
    const sandboxApi = {
        // Test function to verify sandbox is working
        testConnection: () => {
            console.log("Sandbox test function called successfully!");
            return { success: true, message: "Sandbox is working!" };
        },

        // Add chart image to design using blob
        addChartToDesign: async (blob) => {
            try {
                console.log("🟡 [Sandbox] addChartToDesign called");
                console.log("🟡 [Sandbox] Blob received:", blob);
                console.log("🟡 [Sandbox] Blob type:", blob?.type);
                console.log("🟡 [Sandbox] Blob size:", blob?.size);
                
                if (!blob) {
                    console.error("❌ [Sandbox] No blob provided");
                    return { success: false, error: "No blob provided" };
                }
                
                // Get current page dimensions
                console.log("🟡 [Sandbox] Getting current page...");
                const currentPage = editor.context.currentPage;
                if (!currentPage) {
                    console.error("❌ [Sandbox] No current page found");
                    return { success: false, error: "No current page found" };
                }
                
                console.log("🟡 [Sandbox] Current page found:", currentPage.id);
                const pageWidth = currentPage.width;
                const pageHeight = currentPage.height;
                const centerX = pageWidth / 2;
                const centerY = pageHeight / 2;
                
                console.log("🟡 [Sandbox] Page dimensions:", { pageWidth, pageHeight, centerX, centerY });
                
                // Load the bitmap image directly from blob (async operation)
                console.log("🟡 [Sandbox] Loading bitmap image from blob...");
                const bitmapImage = await editor.loadBitmapImage(blob);
                console.log("🟡 [Sandbox] Bitmap image loaded:", bitmapImage);
                console.log("🟡 [Sandbox] Bitmap image type:", typeof bitmapImage);
                
                // After async operation, use queueAsyncEdit for document changes
                editor.queueAsyncEdit(() => {
                    // Create image container without initialSize - uses bitmap's natural dimensions
                    // This ensures the aspect ratio matches exactly
                    const mediaContainer = editor.createImageContainer(bitmapImage);
                    
                    // Get the actual dimensions after creation to position it
                    const chartWidth = mediaContainer.width || 400;
                    const chartHeight = mediaContainer.height || 300;
                    
                    // Position chart at center
                    const chartX = centerX - chartWidth / 2;
                    const chartY = centerY - chartHeight / 2;
                    
                    console.log("🟡 [Sandbox] Chart dimensions:", { chartWidth, chartHeight });
                    console.log("🟡 [Sandbox] Chart position:", { chartX, chartY });
                    
                    // Set position (centered)
                    mediaContainer.translation = { x: chartX, y: chartY };
                    
                    // Add to the current artboard
                    editor.context.insertionParent.children.append(mediaContainer);
                    
                    // Auto-select the newly created chart element
                    editor.context.selection = [mediaContainer];
                    
                    console.log("✅ [Sandbox] Chart inserted and selected");
                });
                
                console.log("✅ [Sandbox] addChartToDesign completed successfully");
                
                // Return success - dimensions will be set by the container's natural size
                return { 
                    success: true, 
                    position: { x: centerX, y: centerY, width: 0, height: 0 }
                };
            } catch (error) {
                console.error("❌ [Sandbox] Error in addChartToDesign:", error);
                console.error("❌ [Sandbox] Error message:", error.message);
                console.error("❌ [Sandbox] Error stack:", error.stack);
                return { success: false, error: error.message || "Unknown error occurred" };
            }
        }
    };

    // Expose the API to the UI with explicit name
    runtime.exposeApi(sandboxApi, { name: "documentSandbox" });
}

start();

