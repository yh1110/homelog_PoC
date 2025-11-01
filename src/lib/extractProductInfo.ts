import { uploadFile, runWorkflow } from "./difyClient";
import type { ProductInfo } from "@/types/dify";

/**
 * Extract product information from an image using Dify API
 * @param imageFile - Image file to analyze
 * @param userId - User ID for API request
 * @returns Extracted product information
 */
export async function extractProductInfo(imageFile: File, userId: string): Promise<ProductInfo> {
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

	// Extract result from workflow output
	const outputs = workflowResponse.data.outputs;

	// Parse result based on actual response structure
	if (outputs.result && typeof outputs.result === "object") {
		return outputs.result as ProductInfo;
	}

	throw new Error("Invalid response format from Dify API");
}

/**
 * Format product information for notes field
 * @param productInfo - Product information object
 * @returns Formatted string for notes
 */
export function formatProductInfoForNotes(productInfo: ProductInfo): string {
	const lines = [
		`商品名: ${productInfo.product_name}`,
		`メーカー: ${productInfo.manufacturer}`,
		`型番: ${productInfo.model_number}`,
		`価格: ¥${productInfo.price.toLocaleString()}`,
		`公式ページ: ${productInfo.official_page}`,
		`マニュアル: ${productInfo.manual_link}`,
	];

	return lines.join("\n");
}
