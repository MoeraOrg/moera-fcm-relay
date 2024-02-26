import { NodeName, StorySummaryEntry, StorySummaryNode, StorySummaryReaction } from "pushrelay/api";

export function formatNodeName(
    node: StorySummaryNode | StorySummaryEntry | StorySummaryReaction | null | undefined
): string {
    const {ownerName, ownerFullName} = node ?? {};
    if (ownerName == null) {
        return "&lt;unknown&gt;";
    }
    return ownerFullName != null ? ownerFullName : NodeName.shorten(ownerName);
}

export function formatHeading(entry: StorySummaryEntry | null | undefined): string {
    return "\"" + (entry?.heading ?? "") + "\"";
}
