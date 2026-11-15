# Acceptance scenarios for SafeCampus academic demo.
# Security role selection is a UI simulation, not access control.
Feature: Simulated incident management by security staff
  As a fictional security operator
  I want to inspect, assign and update incident cases
  So that the main operational workflows can be demonstrated

  @HU26
  Scenario: Consult incidents in the security dashboard
    Given the user selects the simulated "Personal de seguridad" role
    When the user opens the operational dashboard
    Then the dashboard lists fictional incidents for review
    And each incident displays its category, location and current status

  @HU27
  Scenario: Assign an incident to a fictional team
    Given the operator is reviewing a fictional incident
    When the operator assigns it to "Equipo A"
    Then the incident displays "Equipo A" as its responsible team
    And the assignment is recorded in its history

  @HU28
  Scenario: Update the operational attention status
    Given a fictional incident is pending attention
    When the operator changes its attention status to "En atención"
    Then the updated attention status is visible in the dashboard
    And the change is recorded in the incident history
