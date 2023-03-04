# Edge Components w/ HTML Streaming

This is a concept repo that provides a Cloudflare Worker that can run over a partially client-side or fully server-side rendered website and inject "components". Components can be blocking or non-blocking. This is heavily based on concepts taken from RSC, Remix, and HTML Streaming in general. 

- It is all built using TransformStream’s.
- It supports blocking and non-blocking components.
- It supports sub-streams with blocking and non-blocking components.
- It is all built around the Request interface:
    - Independent caching can be applied to every level of the component tree.
    - Components can be moved to Workers for Platforms

# The Problem

On FashionNova’s PLP, the request to Algolia that fetches critical data required to render the entire collection page is not initiated until 1.6s into page load. The same happens with many Shopify merchants as third party apps load and inject content on the client-side.

![image](images/image.png)

************************************************FN does use a heavily client-side rendered Shopify Theme. Taking a more liquid-based approach would have had better performance. However, Liquid still cannot fetch data from Algolia.************************************************

# Inspirations

- [Remix](https://remix.run) - There is no server state or client state. It is all forms that can rerender. Responses are also streamed as they are built so that you do not have to wait for all data to be fetched for the entire page to render.
- [EdgeMesh](https://edgemesh.com) - Dynamic fragments, uncached fragments of the page that are loaded via web-worker for swift page loads with partial full page caching.
