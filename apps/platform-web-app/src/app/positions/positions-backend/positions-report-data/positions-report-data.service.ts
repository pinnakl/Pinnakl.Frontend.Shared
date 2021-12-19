import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { first } from 'rxjs/operators';
import { selectAllPositionsReportColumns, selectAllSecurityCustomAttributes } from '../../positions-backend-state';

@Injectable({
  providedIn: 'root'
})
export class PositionsReportDataService {
  private readonly _positionReportEndpoint = 'entities/position_report';
  // Uncomment to test fetching report data after receiving new security id
  // private isFirst = true;
  constructor(private readonly wsp: WebServiceProvider, private readonly store: Store) {}

  async get(positionsDate: Date): Promise<any[]> {
    const entitiesFromApi: any[] = await this.wsp.getHttp({
      endpoint: this._positionReportEndpoint,
      params: {
        filters: [
          {
            key: 'posdate',
            type: 'EQ',
            value: [moment(positionsDate).format('MM/DD/YYYY')]
          }
        ]
      }
    });

    // Following comments code was used for Stamina demo to pull a specific report from database
    // return entitiesFromApi.map(entity => {
    //   let formattedEntity: any = {};
    //   formattedEntity.AssetType = entity.assettype;
    //   formattedEntity.SecurityId = entity.securityid;
    //   formattedEntity.Ticker = entity.ticker;
    //   formattedEntity.Description = entity.description;
    //   formattedEntity.Framework = entity.framework;
    //   formattedEntity.Shares = entity.shares;
    //   formattedEntity.Cost = entity.cost;
    //   formattedEntity.InvestmentAtCost =
    //     entity.shares *
    //     (formattedEntity.AssetType == 'Option'
    //       ? entity.cost * 100
    //       : entity.cost);
    //   formattedEntity.CurrentPrice = 0;
    //   formattedEntity.InvestmentAtMarket = 0;
    //   formattedEntity.PortfolioWeight = 0;
    //   formattedEntity.Delta = 0;
    //   formattedEntity.DeltaAdj = 0;
    //   formattedEntity.Momentum = entity.momentum;
    //   formattedEntity.Tech = entity.tech;
    //   formattedEntity.GDPGrowth = entity.gdpgrowth;
    //   formattedEntity.Value = entity.value;
    //   return formattedEntity;
    // });

    const additionalFields = {};
    this.store
      .pipe(select(selectAllPositionsReportColumns), first())
      .subscribe(reportColumns => {
        reportColumns.forEach(col => {
          if (col.type === 'stream') {
            additionalFields[col.caption] = null;
          }
        });
      });
    this.store
      .pipe(select(selectAllSecurityCustomAttributes), first())
      .subscribe(attrs => {
        attrs.forEach(col => {
          additionalFields[col.name] = null;
        });
      });

    if (
      entitiesFromApi.length > 0 &&
      entitiesFromApi[0].assettype === 'peloan'
    ) {
      return entitiesFromApi.map(entity => {
        const formattedEntity: any = {};
        formattedEntity.AssetType = entity.assettype;
        formattedEntity.peLoanId = entity.peloanid;
        formattedEntity.Description = entity.description;
        formattedEntity.Category = entity.category;
        formattedEntity.Maturity = entity.maturity;
        formattedEntity.PaymentFrequency = entity.paymentfrequency;
        formattedEntity.Sector = entity.sector;
        formattedEntity.SecurityId = +entity.securityid;
        formattedEntity.Face = +entity.face;
        formattedEntity.Balance = +entity.balance;
        formattedEntity.Coupon = +entity.coupon;
        formattedEntity.LTV = +entity.ltv;
        formattedEntity.CouponType = entity.coupontype;
        formattedEntity.Geography = entity.geography;
        formattedEntity.Status = entity.status;
        formattedEntity.Multiplier = entity.multiplier;
        formattedEntity.YTDGLPct = Math.floor(Math.random() * 10);

        return formattedEntity;
      });
    }

    // Uncomment to test fetching report data after receiving new security id
    // if (this.isFirst) {
    //   entitiesFromApi = entitiesFromApi.filter(e => !['4157', '4163', '4201', '4224'].includes(e.securityid));
    //   this.isFirst = false;
    // }
    return this.combineReportDataWithAdditionalFields(entitiesFromApi, additionalFields);
  }

  public combineReportDataWithAdditionalFields(entitiesFromApi: any, additionalFields: any): any {
    return entitiesFromApi.map(
      ({
         accountcode,
         accountid,
         analyst,
         assettype,
         coupon,
         cost,
         cusip,
         customattributeid,
         description,
         foldercode,
         identifier,
         isin,
         lmvlocal,
         lmvusd,
         lmvusdlast,
         lmvusdpct,
         loanid,
         localcurrency,
         maturity,
         moodyrating,
         mtd_pnl,
         mvlocal,
         mvusd,
         mvusdlast,
         mvusdpct,
         orgticker,
         position,
         pricelast,
         sandprating,
         sector,
         securityid,
         sedol,
         smvlocal,
         smvusd,
         smvusdlast,
         smvusdpct,
         strategy,
         ticker,
         trader,
         ytd_pnl,
         multiplier,
         direction,
         beta_idc,
         beta_riskProvider,
         longposition,
         shortposition,
         aglpmvpct,
         aglppos,
         awwmvpct,
         awwpos,
         mvusdlastpct,
         underlyingsecid,
         ...other
       }) => ({
        AccountCode: accountcode,
        AccountId: getNumber(accountid),
        Analyst: analyst,
        AssetType: assettype,
        Coupon: getNumber(coupon),
        Cost: getNumber(cost),
        Cusip: cusip,
        CustomAttributeId: getNumber(customattributeid),
        Description: description,
        Direction: direction,
        FolderCode: foldercode,
        Identifier: identifier,
        Isin: isin,
        LMVLocal: getNumber(lmvlocal),
        LMVUSD: getNumber(lmvusd),
        LMVUSDLast: getNumber(lmvusdlast),
        LMVUSDPCT: getNumber(lmvusdpct),
        LoanId: loanid,
        LocalCurrency: localcurrency,
        Maturity: getDate(maturity, 'MM/DD/YYYY hh:mm:ss A'),
        MoodyRating: moodyrating,
        Mtd_Pnl: getNumber(mtd_pnl),
        MVLocal: getNumber(mvlocal),
        MVUSD: getNumber(mvusd),
        MVUSDLast: getNumber(mvusdlast),
        MVUSDPct: getNumber(mvusdpct),
        OrgTicker: orgticker,
        Position: getNumber(position),
        PriceLast: getNumber(pricelast),
        SandPRating: sandprating,
        Sector: sector,
        SecurityId: getNumber(securityid),
        Sedol: sedol,
        SMVLocal: getNumber(smvlocal),
        SMVUSD: getNumber(smvusd),
        SMVUSDLast: getNumber(smvusdlast),
        SMVUSDPCT: getNumber(smvusdpct),
        Strategy: strategy,
        Ticker: ticker,
        Trader: trader,
        'Beta-IDC': beta_idc,
        'Beta-RiskProvider': beta_riskProvider,
        Ytd_Pnl: getNumber(ytd_pnl),
        Multiplier: getNumber(multiplier),
        LongPosition: getNumber(longposition),
        ShortPosition: getNumber(shortposition),
        AGLPPos: getNumber(aglppos),
        AWWPos: getNumber(awwpos),
        AGLPMVPct: getNumber(aglpmvpct),
        AWWMVPct: getNumber(awwmvpct),
        MVUSDLastPct: getNumber(mvusdlastpct),
        UnderlyingSecId: getNumber(underlyingsecid),
        ...mappedAdditionalFields(additionalFields, other)
      })
    );
  }
}

function getDate(value: string, format: string): Date {
  const dateMoment = moment(value, format);
  return dateMoment.isValid() ? dateMoment.toDate() : null;
}

function getNumber(value: string): number {
  const numericValue = +value;
  return isNaN(numericValue) ? null : numericValue;
}

function mappedAdditionalFields(additionalFields: any, data: any): any {
  const lowerCaseData = objectKeysToLowerKeys(data);
  for (const i in additionalFields) {
    additionalFields[i] = lowerCaseData[i.toLowerCase()];
  }
  return additionalFields;
}

function objectKeysToLowerKeys(obj: any): any {
  const keys = Object.keys(obj);
  let n = keys.length,
    key;
  const newObj = {};
  while (n--) {
    key = keys[n];
    newObj[key.toLowerCase()] = obj[key];
  }
  return newObj;
}
