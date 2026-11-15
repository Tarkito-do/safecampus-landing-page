# Acceptance scenarios for SafeCampus academic demo.
Feature: Create and manage fictional community incident reports
  As a university student
  I want to document and review my incident reports
  So that the community demonstration has traceable contributions

  @HU11
  Scenario: Create a fictional incident with valid required data
    Given the student opens the new report form
    When the student provides a category, description and location
    And the student submits the report
    Then the new report is listed under "Mis reportes"
    And the report has an initial pending validation state

  @HU12
  Scenario: Attach a supported image as fictional evidence
    Given the student is completing a new incident report
    When the student attaches a JPG, PNG or WebP image smaller than 200 KB
    Then a preview of the selected image is available
    And the image is shown with the saved report details

  @HU12 @negative
  Scenario: Reject evidence above the demo size limit
    Given the student is completing a new incident report
    When the student selects an image larger than 200 KB
    Then the interface rejects the attachment and explains the size limit

  @HU13
  Scenario: Select an incident location manually
    Given the student is completing a new incident report
    When the student selects "Elegir en mapa"
    And the student chooses a point on the map
    And the student confirms the selected location
    Then the report form contains the selected latitude and longitude

  @HU14
  Scenario: Edit a report while validation is pending
    Given the student has a self-authored pending report
    When the student edits its category or description and saves
    Then the updated information appears in the report details
    And a report that is already confirmed cannot be edited

  @HU15
  Scenario: Fill incident coordinates using permitted browser GPS
    Given the student is completing a new incident report
    And the browser grants geolocation permission
    When the student selects "Usar GPS"
    Then the coordinates returned by the browser populate the location fields

  @HU15 @negative
  Scenario: Explain unavailable or denied GPS
    Given the student is completing a new incident report
    And browser geolocation is denied or unavailable
    When the student selects "Usar GPS"
    Then the form displays a comprehensible error
    And the student can still select the incident location manually

  @HU21
  Scenario: Initialize a new report as pending
    Given the student completes the required fields of a new report
    When the student saves the fictional report
    Then its validation status is pending
    And its community confirmation count is zero

  @HU29
  Scenario: Review previously submitted reports
    Given the student has published fictional reports
    When the student opens "Mis reportes"
    Then the list shows reports authored by that student
    And previously withdrawn reports remain available as withdrawn entries

  @HU30
  Scenario: Withdraw a self-authored pending report
    Given the student has a self-authored pending report
    When the student chooses to withdraw it and confirms the action
    Then the report no longer appears among active map incidents
    And it remains in "Mis reportes" marked as withdrawn
