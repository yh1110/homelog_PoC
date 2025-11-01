import type { VercelRequest, VercelResponse } from "@vercel/node";
import formidable from "formidable";
import fs from "fs";

export const config = {
	api: {
		bodyParser: false,
	},
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
	// CORS headers
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
	);

	if (req.method === "OPTIONS") {
		res.status(200).end();
		return;
	}

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const apiKey = process.env.DIFY_API_KEY;
	const apiUrl = process.env.DIFY_API_URL;

	if (!apiKey || !apiUrl) {
		return res.status(500).json({
			code: "server_config_error",
			message: "Server configuration error: Missing API credentials",
			status: 500,
		});
	}

	try {
		// Parse multipart form data using formidable
		const form = formidable({
			maxFileSize: 15 * 1024 * 1024, // 15MB limit
			keepExtensions: true,
		});

		const parseForm = (): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
			return new Promise((resolve, reject) => {
				form.parse(req as unknown as import('http').IncomingMessage, (err, fields, files) => {
					if (err) reject(err);
					else resolve({ fields, files });
				});
			});
		};

		const { fields, files } = await parseForm();

		// Extract file and user from parsed data
		const fileArray = files.file;
		const userArray = fields.user;

		if (!fileArray || (Array.isArray(fileArray) && fileArray.length === 0)) {
			return res.status(400).json({
				code: "missing_file",
				message: "Please upload your file.",
				status: 400,
			});
		}

		const uploadedFile = Array.isArray(fileArray) ? fileArray[0] : fileArray;
		const user = Array.isArray(userArray) ? userArray[0] : userArray;

		// Create FormData for Dify API
		const formData = new FormData();

		// Read the file and create a Blob
		const fileBuffer = fs.readFileSync(uploadedFile.filepath);
		const fileBlob = new Blob([fileBuffer], { type: uploadedFile.mimetype || "application/octet-stream" });

		formData.append("file", fileBlob, uploadedFile.originalFilename || "upload");
		if (user) {
			formData.append("user", user);
		}

		// Forward the request to Dify API
		const response = await fetch(`${apiUrl}/files/upload`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
			body: formData,
		});

		// Clean up temporary file
		try {
			fs.unlinkSync(uploadedFile.filepath);
		} catch (cleanupError) {
			console.error("Failed to clean up temporary file:", cleanupError);
		}

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));

			// Handle specific file upload errors
			if (response.status === 413) {
				return res.status(413).json({
					code: "file_too_large",
					message: "File size exceeds the maximum allowed limit",
					status: 413,
				});
			}

			if (response.status === 415) {
				return res.status(415).json({
					code: "unsupported_file_type",
					message: "Unsupported file type",
					status: 415,
				});
			}

			return res.status(response.status).json({
				code: errorData.code || "upload_error",
				message: errorData.message || "File upload failed",
				status: response.status,
			});
		}

		const data = await response.json();
		return res.status(200).json(data);
	} catch (error) {
		console.error("File upload error:", error);
		return res.status(500).json({
			code: "internal_server_error",
			message: error instanceof Error ? error.message : "Unknown error",
			status: 500,
		});
	}
}
