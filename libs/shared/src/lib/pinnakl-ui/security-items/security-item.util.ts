import { SecurityMarketFlattened } from '../../models/security/security-market-flattened.model';
import { SecurityItem } from './security-items.component';

const colors = ['#ba68c8', '#ffb74d', '#4dd0e1', '#673ab7'];

export function mapSecuritiesData(securities: SecurityMarketFlattened[]): SecurityItem[] {
	if (!securities || securities.length === 0) {
		return [];
	}
	let i = 0;
	const mappedSecurities: SecurityItem[] = [];
	for (const security of securities) {
		let searchString = '';
		const sec = { ...security, color: '', searchString: ' '} as SecurityItem;
		const { ticker, cusip, assetType } = security;
		if (assetType) {
			searchString += `${assetType} - `;
		}
		if (ticker) {
			searchString += `${ticker} - `;
		}
		if (cusip) {
			searchString += `${cusip} - `;
		}
		if (i === colors.length) {
			i = 0;
		}
		sec.color = colors[i];
		i += 1;
		sec.searchString = searchString + security.description;
		mappedSecurities.push(sec);
	}
	return mappedSecurities;
}

export function getCurrentSymbol (text: string): string  {
	return text.length ? text[0].toUpperCase() : '-';
}

export function addAlpha(color: string, opacity = 0.4): string {
	const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
	return color + _opacity.toString(16).toUpperCase();
}
