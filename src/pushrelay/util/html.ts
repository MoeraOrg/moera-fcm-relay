import * as HtmlEntities from 'html-entities';

export function clearHtml(html: string | null | undefined): string {
    return unhtmlEntities(html).replace(/<\/?[a-z][^>]*>/gi, "").trim();
}

export function unhtmlEntities(s: string | null | undefined): string {
    return HtmlEntities.decode(s);
}
