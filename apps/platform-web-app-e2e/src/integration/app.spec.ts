import { getLoginForm } from '../support/app.po';

describe('{your-app}', () => {
  beforeEach(() => cy.visit('/'));

  it('should have login form', () => {
    getLoginForm().should('have.class', 'ng-untouched');
    cy.get('.login-form input').should('have.length', 3);
  });
});
