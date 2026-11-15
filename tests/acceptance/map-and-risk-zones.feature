# Acceptance scenarios for SafeCampus academic demo.
# Scenario descriptions use fictional incidents; these are not executed automatically.
Feature: Risk map and location discovery
  As a university community member
  I want to inspect and filter fictional risk reports
  So that I can understand the preventive information shown in the demo

  @HU01
  Scenario: View the interactive map of fictional incidents
    Given the student opens the SafeCampus map
    When the map view finishes loading
    Then the interface displays a map centered on Lima
    And fictional incident markers are available for consultation
    And the user can change the map zoom level

  @HU02
  Scenario: Open an incident detail from the map
    Given the map displays a fictional incident marker
    When the student opens the marker details
    Then the incident category and location are displayed
    And the report date, risk level and validation status are visible

  @HU03
  Scenario: Filter incidents by category
    Given the map contains fictional incidents in different categories
    When the student selects an incident category filter
    Then the visible markers and incident list match the selected category

  @HU04
  Scenario: Filter incidents by time period
    Given the map contains reports with different dates
    When the student selects a recent time range
    Then only incidents within the selected range appear in the filtered results

  @HU05
  Scenario: Find a district using the manual search
    Given the student is viewing the risk map
    When the student searches for "Miraflores"
    Then the map focuses on the matching district
    And the interface provides feedback when a search has no matches

  @HU06
  Scenario: Toggle the illustrative density layer
    Given the risk map displays fictional report locations
    When the student enables the density layer
    Then the map displays an illustrative concentration of reports
    When the student disables the density layer
    Then the illustrative density layer is hidden

  @HU07
  Scenario: Reflect a new fictional report across tabs of the same origin
    Given two SafeCampus tabs are open in the same browser origin
    When a student publishes a valid fictional incident in the first tab
    Then the second tab reflects the new report without a manual reload
    And this synchronization does not require another device or a real server

  @HU08
  Scenario: Restore map defaults
    Given the student has applied filters and enabled the density layer
    When the student chooses "Restablecer vista"
    Then the map returns to its default Lima position
    And the filters are cleared
    And the density layer is disabled
