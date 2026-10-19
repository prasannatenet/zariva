import { useEffect } from "react";
import { useGetSettingsQuery } from "../../store/api/productApi";

/**
 * SiteMetaSync — reads /api/v1/settings and keeps <title>, favicon,
 * and <meta name="description"> in sync with whatever the admin sets.
 * Renders nothing visible; purely a side-effect component.
 */
function SiteMetaSync() {
    const { data: settingsData } = useGetSettingsQuery();
    const settings = settingsData?.data ?? {};

    // ── Page title ──────────────────────────────────────────────────
    useEffect(() => {
        if (settings.site_name) {
            document.title = settings.site_name;
        }
    }, [settings.site_name]);

    // ── Meta description ─────────────────────────────────────────────
    useEffect(() => {
        if (!settings.description) return;
        let tag = document.querySelector("meta[name='description']");
        if (!tag) {
            tag = document.createElement("meta");
            tag.setAttribute("name", "description");
            document.head.appendChild(tag);
        }
        tag.setAttribute("content", settings.description);
    }, [settings.description]);

    // ── Favicon ───────────────────────────────────────────────────────
    useEffect(() => {
        const faviconUrl = settings.favicon || settings.logo;
        if (!faviconUrl) return;

        // Update / create the <link rel="icon"> tag
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
        }
        link.href = faviconUrl;

        // Also update apple-touch-icon for iOS home screen
        let appleLink = document.querySelector("link[rel='apple-touch-icon']");
        if (!appleLink) {
            appleLink = document.createElement("link");
            appleLink.rel = "apple-touch-icon";
            document.head.appendChild(appleLink);
        }
        appleLink.href = faviconUrl;
    }, [settings.favicon, settings.logo]);

    return null;
}

export default SiteMetaSync;
