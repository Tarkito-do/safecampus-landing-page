# Acceptance scenarios for SafeCampus academic demo.
Feature: Community confirmation and simulated security verification
  As a member of the SafeCampus community
  I want to distinguish confirmed and discarded reports
  So that the demo clearly communicates report reliability

  @HU16
  Scenario: Confirm an existing report only once per fictional student
    Given the student views the fictional report "D-023" created by another user
    When the student confirms that report
    Then its community confirmation count increases
    And the same student cannot confirm it a second time
    And a student cannot confirm their own report

  @HU17
  Scenario: Discard a fictional report from the security view
    Given the operator selects the simulated security role
    And an incident is pending review
    When the operator marks the incident as discarded
    Then the incident is removed from active map results
    And the decision is recorded in the incident history

  @HU18
  Scenario: Display report validation state consistently
    Given the demo contains pending and confirmed incident reports
    When the student opens incident cards and details
    Then their validation states are displayed with understandable labels
    And discarded incidents are identifiable within the corresponding history

  @HU19
  Scenario: Consult the verification history of an incident
    Given a fictional report has recorded security review actions
    When the operator opens that report's history
    Then the recorded actions are displayed
    And each action includes a date or timestamp

  @HU20
  Scenario: Notify the author about a discarded report
    Given fictional report "D-021" has an author
    When the simulated security operator discards "D-021"
    And the student opens "Comunidad" and "Mis avisos"
    Then a fictional notice explains that the report was discarded
