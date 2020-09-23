import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { ReconciliationCommentFromApi } from '../models/recon/reconciliation-comment-from-api.model';
import { ReconciliationComment } from '../models/recon/reconciliation-comment.model';
import { Utility } from '../services/utility.service';

@Injectable()
export class PinnaklCommentService {
  private readonly RESOURCE_URL = 'recon_comments';

  constructor(private wsp: WebServiceProvider, private utility: Utility) {}

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
    let deleteCommentRequestBody = {
      id
    };
    return this.wsp.delete({
      endPoint: this.RESOURCE_URL,
      payload: deleteCommentRequestBody
    });
  }

  private getPnklComments(
    accountId: number,
    entityId: number,
    securityId: number
  ): Promise<ReconciliationComment[]> {
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
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
      }
    };
    return this.wsp
      .get(getWebRequest)
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
    let postCommentRequestBody = {
      accountId,
      comment,
      entityId,
      reconDate: moment(reconciliationDate).format('MM/DD/YYYY'),
      securityId
    };
    return this.wsp
      .post({
        endPoint: this.RESOURCE_URL,
        payload: postCommentRequestBody
      })
      .then((pinnaklComment: ReconciliationCommentFromApi) =>
        this.formatReconComment(pinnaklComment)
      );
  }

  private putPnklComment(
    id: number,
    comment: string
  ): Promise<ReconciliationComment> {
    let putCommentRequestBody = {
      id,
      comment
    };
    return this.wsp
      .put({
        endPoint: this.RESOURCE_URL,
        payload: putCommentRequestBody
      })
      .then((pinnaklComment: ReconciliationCommentFromApi) =>
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
