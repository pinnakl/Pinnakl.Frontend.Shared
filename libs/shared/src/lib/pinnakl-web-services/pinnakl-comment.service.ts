import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { ReconciliationComment } from '../models/recon';
import { ReconciliationCommentFromApi } from '../models/recon/reconciliation-comment-from-api.model';
import { Utility } from '../services';

@Injectable()
export class PinnaklCommentService {
  private readonly reconCommentsEndpoint = 'entities/recon_comments';

  constructor(private readonly wsp: WebServiceProvider, private readonly utility: Utility) {}

  savePnklComment(
    accountId: number,
    comment: string,
    entityId: number,
    reconciliationDate: Date,
    securityId: number
  ): Promise<ReconciliationComment> {
    return this.getPnklComments(accountId, entityId, securityId).then(
      reconComments => {
        let existingReconComment = reconComments.find(
          reconComment =>
            this.utility.compareDatesWithoutTime(
              reconComment.reconDate,
              reconciliationDate
            ) === 0
        );
        if (existingReconComment) {
          if (comment) {
            return this.putPnklComment(existingReconComment.id, comment);
          } else {
            return this.deletePnklComment(existingReconComment.id);
          }
        }
        return this.postPnklComment(
          accountId,
          comment,
          entityId,
          reconciliationDate,
          securityId
        );
      }
    );
  }

  private deletePnklComment(id: number): Promise<ReconciliationComment> {
    return this.wsp.deleteHttp({
      endpoint: `${this.reconCommentsEndpoint}/${id}`
    });
  }

  private getPnklComments(
    accountId: number,
    entityId: number,
    securityId: number
  ): Promise<ReconciliationComment[]> {
    return this.wsp
      .getHttp<ReconciliationCommentFromApi[]>({
        params: {
          fields: ['Id', 'Comment', 'ReconDate'],
          filters: [
            {
              key: 'AccountId',
              type: 'EQ',
              value: [accountId.toString()]
            },
            {
              key: 'EntityId',
              type: 'EQ',
              value: [entityId.toString()]
            },
            {
              key: 'SecurityId',
              type: 'EQ',
              value: [securityId.toString()]
            }
          ]
        },
        endpoint: this.reconCommentsEndpoint
      })
      .then((reconComments: ReconciliationCommentFromApi[]) =>
        reconComments.map(reconComment => this.formatReconComment(reconComment))
      );
  }

  private postPnklComment(
    accountId: number,
    comment: string,
    entityId: number,
    reconciliationDate: Date,
    securityId: number
  ): Promise<ReconciliationComment> {
    return this.wsp.postHttp<ReconciliationCommentFromApi>({
      endpoint: this.reconCommentsEndpoint,
      body: {
        comment,
        entityId: entityId.toString(),
        accountId: accountId.toString(),
        securityId: securityId.toString(),
        reconDate: moment(reconciliationDate).format('MM/DD/YYYY')
      }
    }).then((pinnaklComment: ReconciliationCommentFromApi) =>
      this.formatReconComment(pinnaklComment)
    );
  }

  private putPnklComment(
    id: number,
    comment: string
  ): Promise<ReconciliationComment> {
    return this.wsp.putHttp<ReconciliationCommentFromApi>({
      endpoint: this.reconCommentsEndpoint,
      body: { id: id.toString(), comment }
    }).then((pinnaklComment: ReconciliationCommentFromApi) =>
      this.formatReconComment(pinnaklComment)
    );
  }

  private formatReconComment(
    reconComment: ReconciliationCommentFromApi
  ): ReconciliationComment {
    let accountId = parseInt(reconComment.accountid),
      entityId = parseInt(reconComment.entityid),
      id = parseInt(reconComment.id),
      reconDateMoment = moment(reconComment.recondate, 'MM/DD/YYYY'),
      securityId = parseInt(reconComment.securityid),
      userId = parseInt(reconComment.userid);
    return {
      accountId: !isNaN(accountId) ? accountId : null,
      comment: reconComment.comment,
      entityId: !isNaN(entityId) ? entityId : null,
      id: !isNaN(id) ? id : null,
      reconDate: reconDateMoment.isValid() ? reconDateMoment.toDate() : null,
      securityId: !isNaN(securityId) ? securityId : null,
      userId: !isNaN(userId) ? userId : null
    };
  }
}
