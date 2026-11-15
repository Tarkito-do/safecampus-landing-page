# Acceptance scenarios for SafeCampus academic demo.
Feature: Preventive route and notification preferences
  As a university student
  I want to configure relevant zones, time periods and distances
  So that the fictional alerts reflect my preferences

  @HU09
  Scenario: Save frequently visited zones
    Given the student opens the profile preferences
    When the student saves a frequently visited zone
    Then the saved preference is shown in the profile
    And the map can highlight preventive information matching that zone

  @HU10
  Scenario: Apply a preferred alert time window
    Given the student has selected a preferred travel time window
    When the student saves the time preference and runs the proximity simulation
    Then the simulation takes that time preference into account
    And it explains when the alert is outside the configured time window

  @HU22
  Scenario: Save the preventive alert distance
    Given the student opens the distance preference
    When the student selects an allowed alert radius and saves it
    Then the selected radius remains available in the profile
    And the proximity simulation uses that radius
