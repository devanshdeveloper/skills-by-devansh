/**
 * NextWebWorks (NWW) Visitor Identity Client SDK
 * Drop-in browser client script for NWW websites.
 *
 * Automatically manages:
 * - Permanent 128-bit device ID persistence in localStorage.
 * - Silent visitor session initialization and token exchange.
 * - Proactive token renewal (every 14 minutes for 15-minute ES256 tokens).
 * - Automatic Authorization header injection for downstream calls (e.g. YouTube downloader).
 */

(function (window) {
    class NWWVisitorSDK {
        constructor(config = {}) {
            this.websiteId = config.websiteId || window.NWW_WEBSITE_ID;
            this.apiBaseUrl = (config.apiBaseUrl || window.NWW_API_BASE_URL || "https://prod-server.nextwebworks.com").replace(/\/$/, "");
            this.storageKey = `nww_device_${this.websiteId}`;
            this.tokenStorageKey = `nww_token_${this.websiteId}`;

            this.deviceId = null;
            this.visitorId = null;
            this.accessToken = null;
            this.expiresIn = 900; // 15 minutes
            this.refreshTimer = null;
        }

        async init() {
            if (!this.websiteId) {
                console.error("[NWW Visitor] websiteId is required. Define window.NWW_WEBSITE_ID or pass in config.");
                return;
            }

            // 1. Retrieve stored device ID if present
            try {
                this.deviceId = localStorage.getItem(this.storageKey);
            } catch (e) {
                // localStorage may be restricted in private/sandboxed modes
                this.deviceId = null;
            }

            // 2. Initialize visitor session
            await this.establishSession();

            // 3. Setup proactive renewal at 14 minutes (840 seconds)
            this.scheduleTokenRefresh();
        }

        async establishSession() {
            try {
                const response = await fetch(`${this.apiBaseUrl}/api/visitor/session`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        website: this.websiteId,
                        deviceId: this.deviceId || undefined,
                    }),
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    console.error("[NWW Visitor] Session establishment failed:", err.message);
                    return;
                }

                const data = await response.json();
                const body = data.body || {};

                this.visitorId = body.visitorId;
                this.deviceId = body.deviceId;
                this.accessToken = body.accessToken;
                this.expiresIn = body.expiresIn || 900;

                // Persist device ID permanently on device
                if (this.deviceId) {
                    try {
                        localStorage.setItem(this.storageKey, this.deviceId);
                    } catch (e) {}
                }

                // Dispatch ready event for application consumers
                if (typeof window !== "undefined") {
                    window.dispatchEvent(
                        new CustomEvent("nww:visitor:ready", {
                            detail: {
                                visitorId: this.visitorId,
                                website: this.websiteId,
                                accessToken: this.accessToken,
                            },
                        })
                    );
                }
            } catch (err) {
                console.error("[NWW Visitor] Network error establishing visitor session:", err.message);
            }
        }

        scheduleTokenRefresh() {
            if (this.refreshTimer) clearTimeout(this.refreshTimer);

            // Refresh at 14 minutes (14 * 60 * 1000 = 840,000 ms)
            const refreshIntervalMs = Math.max((this.expiresIn - 60) * 1000, 60000);

            this.refreshTimer = setTimeout(async () => {
                await this.refreshToken();
                this.scheduleTokenRefresh();
            }, refreshIntervalMs);
        }

        async refreshToken() {
            if (!this.deviceId) {
                return this.establishSession();
            }

            try {
                const response = await fetch(`${this.apiBaseUrl}/api/visitor/token`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        website: this.websiteId,
                        deviceId: this.deviceId,
                    }),
                });

                if (!response.ok) {
                    // If device ID is no longer recognized, re-establish fresh session
                    return this.establishSession();
                }

                const data = await response.json();
                const body = data.body || {};
                this.accessToken = body.accessToken;
                this.expiresIn = body.expiresIn || 900;
            } catch (err) {
                console.warn("[NWW Visitor] Token refresh failed, will retry on next interval:", err.message);
            }
        }

        getAccessToken() {
            return this.accessToken;
        }

        getVisitorId() {
            return this.visitorId;
        }

        getDeviceId() {
            return this.deviceId;
        }

        getWebsiteId() {
            return this.websiteId;
        }

        /**
         * Convenience fetch wrapper injecting Bearer token for downstream service requests
         */
        async fetch(url, options = {}) {
            const opts = { ...options };
            opts.headers = {
                ...(opts.headers || {}),
                Authorization: `Bearer ${this.accessToken}`,
            };
            return window.fetch(url, opts);
        }
    }

    // Auto-instantiate if NWW_WEBSITE_ID is defined in window
    window.NWWVisitor = new NWWVisitorSDK();
    if (typeof window.NWW_WEBSITE_ID !== "undefined") {
        window.NWWVisitor.init();
    }
})(typeof window !== "undefined" ? window : globalThis);

