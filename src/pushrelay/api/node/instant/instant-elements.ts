import { shorten } from 'moeralib/naming';
import { StorySummaryEntry, StorySummaryNode, StorySummaryReaction } from 'moeralib/node/types';

export function formatNodeName(
    node: StorySummaryNode | StorySummaryEntry | StorySummaryReaction | null | undefined
): string {
    const {ownerName, ownerFullName} = node ?? {};
    if (ownerName == null) {
        return "&lt;unknown&gt;";
    }
    return ownerFullName != null ? ownerFullName : shorten(ownerName);
}

export function formatHeading(entry: StorySummaryEntry | null | undefined): string {
    return "\"" + (entry?.heading ?? "") + "\"";
}
