import { TestBed } from '@angular/core/testing';

import { EntityDurationValidationService } from './entity-duration-validation.service';

describe('EntityDurationValidationService', () => {
  let service: EntityDurationValidationService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntityDurationValidationService]
    });
    service = TestBed.get(EntityDurationValidationService);
  });

  describe('validate()', () => {
    describe('es0 ee0', () => {
      it('ns0 ne0', () => {
        const result = validationResult({
          existingStart: null,
          existingEnd: null,
          newStart: null,
          newEnd: null
        });
        expect(result).toBe(false);
      });
      it('ns0 ne1', () => {
        const result = validationResult({
          existingStart: null,
          existingEnd: null,
          newStart: null,
          newEnd: '02/10/2000'
        });
        expect(result).toBe(false);
      });
      it('ns1 ne0', () => {
        const result = validationResult({
          existingStart: null,
          existingEnd: null,
          newStart: '02/10/2000',
          newEnd: null
        });
        expect(result).toBe(false);
      });
      it('ns1 ne1', () => {
        const result = validationResult({
          existingStart: null,
          existingEnd: null,
          newStart: '02/10/2000',
          newEnd: '02/20/2000'
        });
        expect(result).toBe(false);
      });
    });

    describe('es0 ee1', () => {
      it('ns0 ne0', () => {
        const result = validationResult({
          existingStart: null,
          existingEnd: '02/20/2000',
          newStart: null,
          newEnd: null
        });
        expect(result).toBe(false);
      });
      describe('ns0 ne1', () => {
        it('ne < ee', () => {
          const result = validationResult({
            existingStart: null,
            existingEnd: '02/20/2000',
            newStart: null,
            newEnd: '02/15/2000'
          });
          expect(result).toBe(false);
        });
        it('ne = ee', () => {
          const result = validationResult({
            existingStart: null,
            existingEnd: '02/20/2000',
            newStart: null,
            newEnd: '02/20/2000'
          });
          expect(result).toBe(false);
        });
        it('ne > ee', () => {
          const result = validationResult({
            existingStart: null,
            existingEnd: '02/20/2000',
            newStart: null,
            newEnd: '02/21/2000'
          });
          expect(result).toBe(false);
        });
      });
      describe('ns1 ne0', () => {
        it('ns < ee', () => {
          const result = validationResult({
            existingStart: null,
            existingEnd: '02/20/2000',
            newStart: '02/15/2000',
            newEnd: null
          });
          expect(result).toBe(false);
        });
        it('ns = ee', () => {
          const result = validationResult({
            existingStart: null,
            existingEnd: '02/20/2000',
            newStart: '02/20/2000',
            newEnd: null
          });
          expect(result).toBe(false);
        });
        it('ns > ee', () => {
          const result = validationResult({
            existingStart: null,
            existingEnd: '02/20/2000',
            newStart: '02/22/2000',
            newEnd: null
          });
          expect(result).toBe(true);
        });
      });
      describe('ns1 ne1', () => {
        it('ns,ne < ee', () => {
          const result = validationResult({
            existingStart: null,
            existingEnd: '02/20/2000',
            newStart: '02/15/2000',
            newEnd: '02/16/2000'
          });
          expect(result).toBe(false);
        });
        it('ns < ne=ee', () => {
          const result = validationResult({
            existingStart: null,
            existingEnd: '02/20/2000',
            newStart: '02/15/2000',
            newEnd: '02/20/2000'
          });
          expect(result).toBe(false);
        });
        it('ns=ee < ne', () => {
          const result = validationResult({
            existingStart: null,
            existingEnd: '02/20/2000',
            newStart: '02/20/2000',
            newEnd: '02/22/2000'
          });
          expect(result).toBe(false);
        });
        it('ee < ns,ne', () => {
          const result = validationResult({
            existingStart: null,
            existingEnd: '02/20/2000',
            newStart: '02/22/2000',
            newEnd: '02/24/2000'
          });
          expect(result).toBe(true);
        });
      });
    });

    describe('es1 ee0', () => {
      it('ns0 ne0', () => {
        const result = validationResult({
          existingStart: '02/20/2000',
          existingEnd: null,
          newStart: null,
          newEnd: null
        });
        expect(result).toBe(false);
      });
      describe('ns0 ne1', () => {
        it('ne < es', () => {
          const result = validationResult({
            existingStart: '02/20/2000',
            existingEnd: null,
            newStart: null,
            newEnd: '02/15/2000'
          });
          expect(result).toBe(true);
        });
        it('ne = es', () => {
          const result = validationResult({
            existingStart: '02/20/2000',
            existingEnd: null,
            newStart: null,
            newEnd: '02/20/2000'
          });
          expect(result).toBe(false);
        });
        it('ne > es', () => {
          const result = validationResult({
            existingStart: '02/20/2000',
            existingEnd: null,
            newStart: null,
            newEnd: '02/21/2000'
          });
          expect(result).toBe(false);
        });
      });
      describe('ns1 ne0', () => {
        it('ns < es', () => {
          const result = validationResult({
            existingStart: '02/20/2000',
            existingEnd: null,
            newStart: '02/15/2000',
            newEnd: null
          });
          expect(result).toBe(false);
        });
        it('ns = es', () => {
          const result = validationResult({
            existingStart: '02/20/2000',
            existingEnd: null,
            newStart: '02/20/2000',
            newEnd: null
          });
          expect(result).toBe(false);
        });
        it('ns > es', () => {
          const result = validationResult({
            existingStart: '02/20/2000',
            existingEnd: null,
            newStart: '02/22/2000',
            newEnd: null
          });
          expect(result).toBe(false);
        });
      });
      describe('ns1 ne1', () => {
        it('ns,ne < es', () => {
          const result = validationResult({
            existingStart: '02/20/2000',
            existingEnd: null,
            newStart: '02/15/2000',
            newEnd: '02/16/2000'
          });
          expect(result).toBe(true);
        });
        it('ns < ne=es', () => {
          const result = validationResult({
            existingStart: '02/20/2000',
            existingEnd: null,
            newStart: '02/15/2000',
            newEnd: '02/20/2000'
          });
          expect(result).toBe(false);
        });
        it('ns=es < ne', () => {
          const result = validationResult({
            existingStart: '02/20/2000',
            existingEnd: null,
            newStart: '02/20/2000',
            newEnd: '02/22/2000'
          });
          expect(result).toBe(false);
        });
        it('es < ns,ne', () => {
          const result = validationResult({
            existingStart: '02/20/2000',
            existingEnd: null,
            newStart: '02/22/2000',
            newEnd: '02/24/2000'
          });
          expect(result).toBe(false);
        });
      });
    });

    describe('es1 ee1', () => {
      it('ns0 ne0', () => {
        const result = validationResult({
          existingStart: '02/10/2000',
          existingEnd: '02/20/2000',
          newStart: null,
          newEnd: null
        });
        expect(result).toBe(false);
      });
      describe('ns0 ne1', () => {
        it('ne < es', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: null,
            newEnd: '02/09/2000'
          });
          expect(result).toBe(true);
        });
        it('ne = es', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: null,
            newEnd: '02/10/2000'
          });
          expect(result).toBe(false);
        });
        it('es < ne < ee', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: null,
            newEnd: '02/12/2000'
          });
          expect(result).toBe(false);
        });
        it('ne = ee', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: null,
            newEnd: '02/20/2000'
          });
          expect(result).toBe(false);
        });
        it('ne > ee', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: null,
            newEnd: '02/21/2000'
          });
          expect(result).toBe(false);
        });
      });
      describe('ns1 ne0', () => {
        it('ns < es', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: '02/08/2000',
            newEnd: null
          });
          expect(result).toBe(false);
        });
        it('ns = es', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: '02/10/2000',
            newEnd: null
          });
          expect(result).toBe(false);
        });
        it('es < ns < ee', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: '02/12/2000',
            newEnd: null
          });
          expect(result).toBe(false);
        });
        it('ns = ee', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: '02/20/2000',
            newEnd: null
          });
          expect(result).toBe(false);
        });
        it('ns > ee', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: '02/22/2000',
            newEnd: null
          });
          expect(result).toBe(true);
        });
      });
      describe('ns1 ne1', () => {
        it('ne < es', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: '02/01/2000',
            newEnd: '02/08/2000'
          });
          expect(result).toBe(true);
        });
        it('ne = es', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: '02/01/2000',
            newEnd: '02/10/2000'
          });
          expect(result).toBe(false);
        });
        it('ns<es && es<ne<ee', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: '02/01/2000',
            newEnd: '02/12/2000'
          });
          expect(result).toBe(false);
        });
        it('ns<es && ne=ee', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: '02/01/2000',
            newEnd: '02/20/2000'
          });
          expect(result).toBe(false);
        });
        it('ns<es && ne>ee', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: '02/01/2000',
            newEnd: '02/21/2000'
          });
          expect(result).toBe(false);
        });
        it('ns=es && es<ne<ee', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: '02/10/2000',
            newEnd: '02/12/2000'
          });
          expect(result).toBe(false);
        });
        it('es<ns<ee && es<ne<ee', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: '02/11/2000',
            newEnd: '02/12/2000'
          });
          expect(result).toBe(false);
        });
        it('es<ns<ee && ne=ee', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: '02/11/2000',
            newEnd: '02/20/2000'
          });
          expect(result).toBe(false);
        });
        it('es<ns<ee && ne>ee', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: '02/11/2000',
            newEnd: '02/22/2000'
          });
          expect(result).toBe(false);
        });
        it('ns=ee && ne>ee', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: '02/20/2000',
            newEnd: '02/22/2000'
          });
          expect(result).toBe(false);
        });
        it('ns>ee', () => {
          const result = validationResult({
            existingStart: '02/10/2000',
            existingEnd: '02/20/2000',
            newStart: '02/21/2000',
            newEnd: '02/22/2000'
          });
          expect(result).toBe(true);
        });
      });
    });
  });

  function getDate(dateString: string): Date {
    return dateString ? new Date(dateString) : null;
  }

  function validationResult({
    existingEnd,
    existingStart,
    newEnd,
    newStart
  }: {
    existingEnd: string;
    existingStart: string;
    newEnd: string;
    newStart: string;
  }): boolean {
    const existingEndDate = getDate(existingEnd),
      existingStartDate = getDate(existingStart),
      newEndDate = getDate(newEnd),
      newStartDate = getDate(newStart);
    return service.validate(
      { endDate: existingEndDate, startDate: existingStartDate },
      { endDate: newEndDate, startDate: newStartDate }
    );
  }
});

/*
Legend
es - existing start date
ee - existing end date
ns - new start date
ne - new end date
0 - no value
1 - has value
*/
