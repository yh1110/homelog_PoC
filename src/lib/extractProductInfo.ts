import { uploadFile, runWorkflow } from "./difyClient";
import type { ProductInfo } from "@/types/dify";

/**
 * Extract product information from an image using Dify API
 * @param imageFile - Image file to analyze
 * @param userId - User ID for API request
 * @returns Extracted product information
 */
export async function extractProductInfo(
  imageFile: File,
  userId: string
): Promise<ProductInfo> {
  // Upload image to Dify
  const uploadResponse = await uploadFile(imageFile, userId);

  console.log(uploadResponse);

  // Run workflow with uploaded image
  const workflowResponse = await runWorkflow({
    inputs: {
      image: {
        transfer_method: "local_file",
        upload_file_id: uploadResponse.id,
        type: "image",
      },
    },
    user: userId,
  });

  // Check if workflow failed
  if (workflowResponse.data.status === "failed") {
    const errorMsg = workflowResponse.data.error || "Unknown error";
    console.error("Dify workflow failed:", errorMsg);
    console.error("Full response:", workflowResponse);
    throw new Error(`Difyワークフローエラー: ${errorMsg}`);
  }

  // Extract result from workflow output
  const outputs = workflowResponse.data.outputs;
  // Parse result based on actual response structure
  // Try different possible response formats
  if (outputs.result && typeof outputs.result === "object") {
    return outputs.result as ProductInfo;
  }

  // If result is a string (JSON), try parsing it
  if (outputs.result && typeof outputs.result === "string") {
    try {
      const parsed = JSON.parse(outputs.result);
      return parsed as ProductInfo;
    } catch (e) {
      console.error("Failed to parse result as JSON:", e);
    }
  }

  // If outputs itself contains the product info directly
  if (outputs.product_name || outputs.manufacturer || outputs.model_number) {
    return outputs as ProductInfo;
  }

  // Log the full response for debugging
  console.error("Unexpected response structure:", workflowResponse);
  throw new Error("Dify APIから有効なレスポンスが得られませんでした");
}
