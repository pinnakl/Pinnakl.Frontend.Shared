import { Injectable } from '@angular/core';

import { difference, filter, find, groupBy, isEqual, some, uniq } from 'lodash';

import { EntityDurationValidationService } from '@pnkl-frontend/shared';
import { PublicIdentifier } from '@pnkl-frontend/shared';
import { SecurityMarket } from '@pnkl-frontend/shared';
import { MarketService } from '@pnkl-frontend/shared';
import { PublicIdentifierService } from '@pnkl-frontend/shared';
import { TradeService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';

@Injectable()
export class PublicIdentifiersProcessingService {
  constructor(
    private readonly entityDurationValidationService: EntityDurationValidationService,
    private readonly marketService: MarketService,
    private readonly publicIdentifierService: PublicIdentifierService,
    private readonly tradeService: TradeService,
    private readonly utility: Utility
  ) { }

  async saveAllIdentifiers(
    existingIdentifiers: PublicIdentifier[],
    existingSecurityMarkets: SecurityMarket[],
    identifiers: PublicIdentifier[],
    securityId: number,
    securityMarkets: SecurityMarket[]
  ): Promise<{
    errorMessage?: string;
    identifiers?: PublicIdentifier[];
    securityMarkets?: SecurityMarket[];
  }> {
    const primarySecurityMarkets = filter(
      securityMarkets,
      'primaryMarketIndicator'
    );
    if (securityMarkets.length > 0 && primarySecurityMarkets.length !== 1) {
      return { errorMessage: 'Please select exactly one primary market' };
    }

    const validationError = await this.validateIdentifiers(
      existingIdentifiers,
      existingSecurityMarkets,
      identifiers
    );
    if (validationError) {
      return { errorMessage: validationError };
    }

    const [savedIdentifiers, savedSecurityMarkets] = await Promise.all([
      this.saveIdentifiers(existingIdentifiers, identifiers),
      this.saveSecurityMarkets(existingSecurityMarkets, securityMarkets)
    ]);
    if (!savedIdentifiers && !savedSecurityMarkets) {
      return { errorMessage: 'No changes to update' };
    }
    const [newIdentifiers, newSecurityMarkets] = await Promise.all([
      savedIdentifiers
        ? this.publicIdentifierService.getPublicIdentifiers(securityId)
        : null,
      savedSecurityMarkets
        ? this.marketService.getSecurityMarkets(securityId)
        : null
    ]);
    return { identifiers: newIdentifiers, securityMarkets: newSecurityMarkets };
  }

  private getIdentifiersToSave(
    existingEntities: PublicIdentifier[],
    entities: PublicIdentifier[]
  ): {
    add: PublicIdentifier[];
    delete: PublicIdentifier[];
    update: PublicIdentifier[];
  } {
    const identifiersToAdd: PublicIdentifier[] = [],
      identifiersToUpdate: PublicIdentifier[] = [];
    entities.forEach(entity => {
      if (!entity.id) {
        identifiersToAdd.push(entity);
        return;
      }
      const existingEntity = find(existingEntities, ['id', entity.id]),
        updatedEntity = this.getUpdatedIdentifier(entity, existingEntity);
      if (updatedEntity) {
        identifiersToUpdate.push(updatedEntity);
      }
    });
    const identifiersToDelete = existingEntities.filter(
      existingEntity => !some(entities, ['id', existingEntity.id])
    );
    if (
      !identifiersToAdd.length &&
      !identifiersToDelete.length &&
      !identifiersToUpdate.length
    ) {
      return null;
    }
    return {
      add: identifiersToAdd,
      delete: identifiersToDelete,
      update: identifiersToUpdate
    };
  }

  private getUpdatedIdentifier(
    entity: PublicIdentifier,
    existingEntity: PublicIdentifier
  ): PublicIdentifier {
    const updatedEntity = {} as PublicIdentifier;
    const endDate = entity.endDate;
    if (!this.utility.compareDates(endDate, existingEntity.endDate)) {
      updatedEntity.endDate = endDate;
    }
    const identifier = entity.identifier;
    if (!this.utility.compareStrings(identifier, existingEntity.identifier)) {
      updatedEntity.identifier = identifier;
    }
    const identifierType = entity.identifierType;
    if (
      !this.utility.compareStrings(
        identifierType,
        existingEntity.identifierType
      )
    ) {
      updatedEntity.identifierType = identifierType;
    }
    const marketId = entity.marketId;
    if (!this.utility.compareNumeric(marketId, existingEntity.marketId)) {
      updatedEntity.marketId = marketId;
    }
    const startDate = entity.startDate;
    if (!this.utility.compareDates(startDate, existingEntity.startDate)) {
      updatedEntity.startDate = startDate;
    }
    if (isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  private getUpdatedSecurityMarket(
    entity: SecurityMarket,
    existingEntity: SecurityMarket
  ): SecurityMarket {
    const updatedEntity = {} as SecurityMarket;
    const primaryMarketIndicator = !!entity.primaryMarketIndicator;
    if (primaryMarketIndicator !== existingEntity.primaryMarketIndicator) {
      updatedEntity.primaryMarketIndicator = primaryMarketIndicator;
    }
    if (isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  private async saveIdentifiers(
    existingIdentifiers: PublicIdentifier[],
    identifiers: PublicIdentifier[]
  ): Promise<(PublicIdentifier | void)[]> {
    const identifiersToSave = this.getIdentifiersToSave(
      existingIdentifiers,
      identifiers
    );
    if (!identifiersToSave) {
      return null;
    }
    const {
      add: identifiersToAdd,
      update: identifiersToUpdate,
      delete: identifiersToDelete
    } = identifiersToSave;
    return Promise.all([
      ...identifiersToAdd.map(i =>
        this.publicIdentifierService.postIdentifier(i)
      ),
      ...identifiersToDelete.map(
        i => <any>this.publicIdentifierService.deleteIdentifier(i.id)
      ),
      ...identifiersToUpdate.map(i =>
        this.publicIdentifierService.putIdentifier(i)
      )
    ]);
  }

  private async saveSecurityMarkets(
    existingEntities: SecurityMarket[],
    entities: SecurityMarket[]
  ): Promise<void[]> {
    const deletePromises = existingEntities
      .filter(existingEntity => !some(entities, ['id', existingEntity.id]))
      .map(existingEntity =>
        this.marketService.deleteSecurityMarket(existingEntity.id)
      ),
      savePromises = entities.reduce(
        (promises, entity) => {
          if (entity.id) {
            const existingEntity = find(existingEntities, ['id', entity.id]),
              updatedEntity = this.getUpdatedSecurityMarket(
                entity,
                existingEntity
              );
            if (updatedEntity) {
              promises.push(
                this.marketService.putSecurityMarket(updatedEntity)
              );
            }
            return promises;
          }
          promises.push(this.marketService.postSecurityMarket(entity));
          return promises;
        },
        [] as Promise<SecurityMarket>[]
      );
    const allPromises = deletePromises.concat(<any>savePromises);
    return allPromises.length > 0 ? Promise.all(allPromises) : null;
  }

  private async validateIdentifiers(
    existingIdentifiers: PublicIdentifier[],
    existingSecurityMarkets: SecurityMarket[],
    identifiers: PublicIdentifier[]
  ): Promise<string> {
    const identifiersToSave = this.getIdentifiersToSave(
      existingIdentifiers,
      identifiers
    );
    if (!identifiersToSave) {
      return;
    }

    const marketIds = uniq(
      identifiers.filter(i => i.marketId).map(i => i.marketId)
    );
    const durationInvalid = marketIds.some(marketId => {
      const marketIdentifiers = getIdentifiersByMarketId(marketId, identifiers);
      const identifiersByType = groupBy(
        marketIdentifiers,
        i => i.identifierType
      );
      return Object.values(identifiersByType).some(identifiersOfType =>
        this.entityDurationValidationService.someDurationMissing(
          identifiersOfType
        ));
    });
    if (durationInvalid) {
      return 'Unable to save. Please ensure an identifier is active at all times.';
    }

    const marketIdsToDelete = difference(
      existingIdentifiers.map(i => i.marketId),
      identifiers.map(i => i.marketId)
    );
    if (!marketIdsToDelete.length) {
      return;
    }
    const securityMarketIdsToDelete = existingSecurityMarkets
      .filter(sm =>
        marketIdsToDelete.some(
          marketIdToDelete => marketIdToDelete === sm.marketId
        )
      )
      .map(sm => sm.id);
    const securityMarketIdsForWhichTradesExist = await this.tradeService.tradesExistForSecurityMarketId(
      securityMarketIdsToDelete
    );
    if (securityMarketIdsForWhichTradesExist.length) {
      return 'Unable to delete identifier. Please check if trades exist on this market.';
    }
  }
}

const getIdentifiersByMarketId = (
  marketId: number,
  identifiers: PublicIdentifier[]
) => identifiers.filter(i => i.marketId === marketId);
