# Security Policy

This Security Policy was last updated on August 18, 2024 and applies to citizens and permanent residents of the European
Economic Area and Switzerland.

## Technical and organizational measures

We use technical and organizational measures to ensure the security and confidentiality of the personal data we process.
These include, among others:

- **Access restrictions:** Only authorized team members have access to the data according to the V-Code classification.
- **Encryption:** We use end-to-end SSL encryption as standard for the transmission of sensitive data.
- **Server security:** We use strong firewalls and regularly monitor our servers for security breaches.
- **Security audits:** We carry out regular security audits to check the effectiveness of our security measures.

## Confidentiality system

### What are V-Codes?

The V-codes represent our internal code system for confidentiality levels and were originally created as part of
cn23-Identity. They mark the level of confidentiality that certain data or resources have in relation to our work. The
aim is to make it easier for 💙 WeMake AI Team members to recognize and correctly handle sensitive information. The
V-codes range from publicly available information (VC0) to closely guarded secrets (VC3).

### Public VC0

These documents can be easily distributed worldwide as they do not contain any confidential information.

### Internal VC1

These documents are intended exclusively for our team. They contain information about our daily work and internal
projects. They may contain sensitive data, such as details of our technologies or operating procedures.

### Confidential VC2

These files contain sensitive information and are strictly confidential. They are only available to certain team members
and may contain critical strategic data or upcoming business decisions.

### Secret VC3

This level is strictly confidential: only selected team members are allowed to view these documents. They contain
sensitive information that must be protected at all costs and must never be made accessible to outsiders. The security
protocols are strict and compliance is mandatory at all times. Any negligence can have serious consequences - for the
person concerned, the team and the company as a whole.

## Data transmission

Data sent over the internet is not completely secure. While we will take all reasonable steps to ensure the security of
your data, we cannot guarantee the absolute security of any data you transmit to us. Any transmission is at your own
risk.

## Breach of data security

In the event of a data security breach where your personal data has been compromised, we will notify you as soon as
possible. We will also take all necessary steps to rectify the breach and prevent it from happening again.

## Commitment of our team members and service providers

All our team members and service providers are required to comply with the security policy and procedures that we
establish.

## Updates

We may occasionally change or update this Security Policy to reflect changes in our practices or for other operational,
legal or regulatory reasons. We encourage you to periodically review this policy to stay informed about our privacy
practices.

## Security Measures for Contact Form API

This document outlines the security measures implemented in the contact form API to protect against common web
vulnerabilities.

## API Endpoint Security

The `/api/contact` endpoint implements the following security features:

### Input Validation and Sanitization

- All user inputs are sanitized to prevent XSS attacks
- Required fields are validated (full_name, work_email, project_details)
- Email format validation using regex pattern
- Input length restrictions to prevent abuse
- Strict type checking of all form data

### CSRF Protection

- CSRF token required for all form submissions
- Token validation on server side
- Custom headers (`X-Requested-With`) required for submissions

### Rate Limiting

- IP-based rate limiting to prevent abuse
- Configurable request window (default: 5 requests per minute)
- 429 status code returned when limit is exceeded

### Bot Protection

- Honeypot field to detect automated submissions
- Gives false success response to bots while discarding the submission

### Secure Headers

- `X-Content-Type-Options: nosniff` to prevent MIME type sniffing
- `Cache-Control: no-store` to prevent caching of sensitive data
- Appropriate content type headers

### Error Handling

- Sanitized error messages that don't leak implementation details
- Consistent error response format
- All exceptions are caught and properly handled

## Contact Form Security

The contact form (`Contact.astro`) includes the following security features:

### Client-side Validation

- HTML5 pattern validation for all fields
- Required field validation
- Field length limits
- Client-side email format validation
- Character counter for text areas

### CSRF Protection

- Automatic CSRF token generation
- Token included in all form submissions

### Bot Protection

- Hidden honeypot field, invisible to users but visible to bots
- ARIA attributes to maintain accessibility

### UX Enhancements

- Clear validation feedback to users
- Visible labels for all form fields
- Required field indicators
- Disabled submit button during form submission to prevent double-submission
- Clear success/error messages

## Test Coverage

The security features are tested with comprehensive test cases:

- Testing CSRF token validation
- Testing form validation for various input scenarios
- Testing rate limiting
- Testing API responses for different types of requests
- Testing database integration with security features

### Standalone Security Tests

We have implemented dedicated security tests in a separate test file (`tests/security.spec.ts`) that runs after all
functional tests are completed. These security-specific tests verify:

1. **CSRF Protection**: Confirms that requests without valid CSRF tokens are rejected
2. **XSS Prevention**: Tests that malicious script input is either rejected or sanitized
3. **Bot Detection**: Verifies that the honeypot field successfully identifies and handles bot submissions
4. **Email Validation**: Ensures that invalid email formats including potentially malicious inputs are rejected
5. **Rate Limiting**: Tests that the API enforces request limits to prevent abuse

These standalone security tests are configured to run last in the test sequence to ensure that basic functionality is
verified before security edge cases are tested. This approach allows us to:

- Focus specifically on security vulnerabilities without mixing them with functional tests
- Run security tests independently when needed (using `bun test:security`)
- Ensure security tests don't interfere with other tests due to rate limiting or other security measures

## Best Practices

- All user data is sanitized before storage
- Secure headers are used in all responses
- Environment-specific configurations for production vs development
- Error handling that prevents information disclosure
- Regular security testing via automated tests

## Future Enhancements

- Integration with reCAPTCHA for enhanced bot protection
- Content Security Policy (CSP) implementation
- Advanced logging for security events
- API key-based authentication for service-to-service communication
