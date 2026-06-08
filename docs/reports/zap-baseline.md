# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 0 |
| Low | 0 |
| Informational | 2 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Info | Informational | http://127.0.0.1:8080 | Percentage of responses with status code 2xx | 100 % |
| Info | Informational | http://127.0.0.1:8080 | Percentage of endpoints with content type application/javascript | 14 % |
| Info | Informational | http://127.0.0.1:8080 | Percentage of endpoints with content type application/json | 14 % |
| Info | Informational | http://127.0.0.1:8080 | Percentage of endpoints with content type image/png | 14 % |
| Info | Informational | http://127.0.0.1:8080 | Percentage of endpoints with content type image/x-icon | 14 % |
| Info | Informational | http://127.0.0.1:8080 | Percentage of endpoints with content type text/css | 14 % |
| Info | Informational | http://127.0.0.1:8080 | Percentage of endpoints with content type text/html | 14 % |
| Info | Informational | http://127.0.0.1:8080 | Percentage of endpoints with content type text/plain | 14 % |
| Info | Informational | http://127.0.0.1:8080 | Percentage of endpoints with method GET | 100 % |
| Info | Informational | http://127.0.0.1:8080 | Count of total endpoints | 7    |




## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| Modern Web Application | Informational | 1 |
| Storable and Cacheable Content | Informational | Systemic |




## Alert Detail



### [ Modern Web Application ](https://www.zaproxy.org/docs/alerts/10109/)



##### Informational (Medium)

### Description

The application appears to be a modern web application. If you need to explore it automatically then the Ajax Spider may well be more effective than the standard one.

* URL: http://127.0.0.1:8080
  * Node Name: `http://127.0.0.1:8080`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script defer="defer" src="/static/js/main.c426f01c.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`


Instances: 1

### Solution

This is an informational alert and so no changes are required.

### Reference




#### Source ID: 3

### [ Storable and Cacheable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are storable by caching components such as proxy servers, and may be retrieved directly from the cache, rather than from the origin server by the caching servers, in response to similar requests from other users. If the response data is sensitive, personal or user-specific, this may result in sensitive information being leaked. In some cases, this may even result in a user gaining complete control of the session of another user, depending on the configuration of the caching components in use in their environment. This is primarily an issue where "shared" caching servers such as "proxy" caches are configured on the local network. This configuration is typically found in corporate or educational environments, for instance.

* URL: http://127.0.0.1:8080/favicon.ico
  * Node Name: `http://127.0.0.1:8080/favicon.ico`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: http://127.0.0.1:8080/logo192.png
  * Node Name: `http://127.0.0.1:8080/logo192.png`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: http://127.0.0.1:8080/manifest.json
  * Node Name: `http://127.0.0.1:8080/manifest.json`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: http://127.0.0.1:8080/robots.txt
  * Node Name: `http://127.0.0.1:8080/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: http://127.0.0.1:8080/static/css/main.287e7c33.css
  * Node Name: `http://127.0.0.1:8080/static/css/main.287e7c33.css`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=31536000`
  * Other Info: ``

Instances: Systemic


### Solution

Validate that the response does not contain sensitive, personal or user-specific information. If it does, consider the use of the following HTTP response headers, to limit, or prevent the content being stored and retrieved from the cache by another user:
Cache-Control: no-cache, no-store, must-revalidate, private
Pragma: no-cache
Expires: 0
This configuration directs both HTTP 1.0 and HTTP 1.1 compliant caching servers to not store the response, and to not retrieve the response (without validation) from the cache, in response to a similar request.

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3


