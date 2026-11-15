# Acceptance scenarios for SafeCampus academic demo.
# Browser notifications are local and require the page to remain open.
Feature: Proximity alerts and institutional notices
  As a SafeCampus demo user
  I want to receive and manage fictional preventive notices
  So that I can explore the proposed notification flow

  @HU23
  Scenario: Simulate a proximity alert
    Given a student has an enabled alert radius
    And the student keeps the SafeCampus page open
    When the student triggers the proximity simulation near an active fictional incident
    Then the interface displays a preventive alert
    And any browser notification is local and depends on notification permission

  @HU24
  Scenario: Publish a simulated institutional security notice
    Given the operator selects the simulated security role
    When the operator writes and publishes a fictional notice for a zone
    Then the notice is available in the community announcements
    And the interface does not present the operator as an authenticated authority

  @HU25
  Scenario: Temporarily silence proximity alerts
    Given the student has enabled temporary notification silencing
    When the student triggers the proximity simulation
    Then the interface indicates that the preventive alert is silenced
    And no remote push notification is sent
