(async () => {
    const remoteURL = "https://raw.githubusercontent.com/BEANSTASTEGOODALT/Froster/refs/heads/main/content.js";
    const backupURL = "./backup/content.js";

    async function loadCode(url) {
        const response = await fetch(url, { cache: "no-cache" });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.text();
    }

    try {
        const code = await loadCode(remoteURL);
        (new Function(code))();
    } catch (error) {
        console.warn("Remote script failed; loading backup:", error);

        try {
            const code = await loadCode(backupURL);
            (new Function(code))();
        } catch (backupError) {
            console.error("Backup script also failed:", backupError);
        }
    }
})();
