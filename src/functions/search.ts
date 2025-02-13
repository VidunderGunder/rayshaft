// search.ts
import Fuse, { type FuseResult } from "fuse.js";
import type { Config } from "@/components/Settings";

// Helper: Compute Levenshtein distance between two strings.
function levenshtein(a: string, b: string): number {
	const matrix: number[][] = [];
	for (let i = 0; i <= b.length; i++) {
		matrix[i] = [i];
	}
	for (let j = 0; j <= a.length; j++) {
		matrix[0][j] = j;
	}
	for (let i = 1; i <= b.length; i++) {
		for (let j = 1; j <= a.length; j++) {
			if (b.charAt(i - 1) === a.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1, // substitution
					matrix[i][j - 1] + 1, // insertion
					matrix[i - 1][j] + 1, // deletion
				);
			}
		}
	}
	return matrix[b.length][a.length];
}

// Alias boost: Only boost when the alias is a near or exact match.
function getAliasBoost(result: FuseResult<Config>, query: string): number {
	if (!query || !result.item.aliases?.length) return 0;
	let boost = 0;
	for (const alias of result.item.aliases) {
		const distance = levenshtein(query.toLowerCase(), alias.toLowerCase());
		if (distance === 0) {
			boost = Math.max(boost, 0.2);
		} else if (distance <= 2) {
			boost = Math.max(boost, 0.1);
		}
	}
	return boost;
}

/**
 * performSearch
 *
 * @param query - The search string.
 * @param things - An array of Config items to search through.
 * @returns The Fuse results, re-ordered so that items whose name directly contains
 *          the query appear first.
 */
export function performSearch(
	query: string,
	things: Config[],
): FuseResult<Config>[] {
	const fuse = new Fuse(things, {
		keys: [
			{ name: "aliases", weight: 0.8 },
			{ name: "name", weight: 0.2 },
		],
		includeScore: true,
		includeMatches: true,
	});

	const results = fuse.search(query);
	const queryLower = query.toLowerCase();

	// Partition results into two buckets:
	const directMatches: FuseResult<Config>[] = [];
	const otherMatches: FuseResult<Config>[] = [];

	for (const result of results) {
		if (result.item.name.toLowerCase().includes(queryLower)) {
			directMatches.push(result);
		} else {
			otherMatches.push(result);
		}
	}

	// Define an adjusted score that subtracts any alias boost.
	function adjustedScore(result: FuseResult<Config>) {
		return (result.score ?? 0) - getAliasBoost(result, query);
	}

	// Sort each bucket based on the adjusted score.
	directMatches.sort((a, b) => adjustedScore(a) - adjustedScore(b));
	otherMatches.sort((a, b) => adjustedScore(a) - adjustedScore(b));

	// Concatenate: direct matches come first.
	return [...directMatches, ...otherMatches];
}
