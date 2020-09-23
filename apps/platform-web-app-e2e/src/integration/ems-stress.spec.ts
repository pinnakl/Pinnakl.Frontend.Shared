/// <reference types="cypress" />
describe('logs in', () => {
  it('using UI and runs EMS stress test', () => {
    cy.viewport(1440, 800);
    cy.visit('#/login');
    cy.location('hash').should('equal', '#/login');
    // enter valid username and password
    // @ts-ignore
    cy.typeLogin({
      username: Cypress.env('username'),
      password: Cypress.env('password')
    });
    cy.wait(2000);
    // confirm we have logged in successfully
    cy.location('hash').should('equal', '#/reporting/all-reports');

    cy.get('.aside-menu-holder-trigger').click({ force: true });
    cy.wait(500);
    cy.get('[routerlink="/ems"]')
      .click({ force: true })
      .then(() => {
        cy.wait(2000);
        cy.get('.aside-menu-holder-trigger').click({ force: true });
        cy.get('#stress-test')
          .click()
          .then(() => {
            // store actual rows number before test
            const rowsLength = Cypress.$('.ag-center-cols-container > div').length;
            cy.log(`rowsLength ${rowsLength}`);
            cy.waitUntil(() => Cypress.$('#toast-container .toast-success .toast-message').length, {
              timeout: 3000000, // waits up to 3000000 - 50min ms
              interval: 1000 // performs the check every 1000 ms
            });
            cy.wait(5000);
            const TEST_ROWS_ADDED_NUMBER = 1000;
            cy.get('.ag-center-cols-container .ag-row').then($newRows => {
              cy.log(`newRowsLength: ${$newRows.length}`);
              // expect($newRows.length).to.equal(rowsLength + TEST_ROWS_ADDED_NUMBER);
              $newRows.each(function (index: number, element: Element): void {
                const rowId = Cypress.$(element).attr('row-id');
                const $row = cy
                  .get(`.ag-center-cols-container .ag-row[row-id='${rowId}']`)
                  .should('have.attr', 'role', 'row');
                cy.get(`.ag-center-cols-container .ag-row[row-id='${rowId}']`)
                  .click({ force: true })
                  .then(() => {
                    cy.wait(1000);
                    cy.screenshot();
                    cy.get('.order-fills tbody tr:last-child td span').should(
                      'have.class',
                      'ack-ok'
                    );
                  });
              });
            });
          });
      });

    // cy.get('[routerlink="/ems"]').click({force: true}).then(() => {
    //     /* global window */
    //     const userString = window.localStorage.getItem('user');
    //
    //     expect(userString).to.be.a('string');
    //     const user = JSON.parse(userString);
    //
    //     expect(user).to.be.an('object');
    //     expect(user).to.have.keys([
    //       'id',
    //       'clientId',
    //       'username',
    //       'firstName',
    //       'lastName',
    //       'fullName',
    //       'token',
    //       'features'
    //     ]);
    //
    //   });
    //
    // // now we can log out
    // cy.get('img.profile-pic').click();
    // cy.contains('li', 'Logout').click();
    // cy.location('hash').should('equal', '#/login');
  });
});
