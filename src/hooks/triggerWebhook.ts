/**
 * Trigger webhook after post publication
 * Sends POST request to site's webhook URL (e.g., Vercel deployment hook)
 * to trigger frontend rebuild when content changes
 */
export const triggerWebhook = async ({ doc, req, operation }: any) => {
  // Only trigger on update operations when status changes to published
  if (operation === 'update' && doc.status === 'published') {
    try {
      // Get the site relationship to find webhook URL
      const site = typeof doc.site === 'object' ? doc.site : null;

      if (site && site.webhookUrl) {
        console.log(`[Webhook] Triggering rebuild for site: ${site.name}`);

        // Check if fetch is available (not during build)
        if (typeof fetch === 'undefined') {
          console.log('[Webhook] Skipping - fetch not available in build environment');
          return doc;
        }

        // Send POST request to webhook URL with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(site.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'post.published',
            post: {
              id: doc.id,
              title: doc.title,
              slug: doc.slug,
            },
            site: {
              slug: site.slug,
              name: site.name,
            },
            timestamp: new Date().toISOString(),
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          console.log(`[Webhook] Successfully triggered for ${site.name}`);
        } else {
          console.error(`[Webhook] Failed for ${site.name}: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      // Log error but don't fail the post save operation
      console.error('[Webhook] Error triggering webhook:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  return doc;
};
