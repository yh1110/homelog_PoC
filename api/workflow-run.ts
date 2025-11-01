import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	// CORS headers
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
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
		const { inputs, response_mode = "streaming", user, trace_id, workflow_id } = req.body;

		console.log(inputs, response_mode, user, trace_id, workflow_id);

		if (!user) {
			return res.status(400).json({
				code: "invalid_param",
				message: "Missing required parameter: user",
				status: 400,
			});
		}

		// Determine endpoint based on workflow_id
		const endpoint = workflow_id
			? `${apiUrl}/workflows/${workflow_id}/run`
			: `${apiUrl}/workflows/run`;

		const requestBody = {
			inputs: inputs || {},
			response_mode,
			user,
			...(trace_id && { trace_id }),
		};

		console.log(requestBody);

		const headers: Record<string, string> = {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		};

		if (trace_id) {
			headers["X-Trace-Id"] = trace_id;
		}

		const response = await fetch(endpoint, {
			method: "POST",
			headers,
			body: JSON.stringify(requestBody),
		});

		// Handle streaming response
		if (response_mode === "streaming") {
			res.setHeader("Content-Type", "text/event-stream");
			res.setHeader("Cache-Control", "no-cache");
			res.setHeader("Connection", "keep-alive");

			if (!response.body) {
				return res.status(500).json({
					code: "stream_error",
					message: "Failed to establish streaming connection",
					status: 500,
				});
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();

			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value, { stream: true });
					res.write(chunk);
				}
			} catch (streamError) {
				console.error("Streaming error:", streamError);
			} finally {
				res.end();
			}
			return;
		}

		// Handle blocking response
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return res.status(response.status).json({
				code: errorData.code || "workflow_request_error",
				message: errorData.message || "Workflow execution failed",
				status: response.status,
			});
		}

		const data = await response.json();
		return res.status(200).json(data);
	} catch (error) {
		console.error("Workflow execution error:", error);
		return res.status(500).json({
			code: "internal_server_error",
			message: error instanceof Error ? error.message : "Unknown error",
			status: 500,
		});
	}
}
