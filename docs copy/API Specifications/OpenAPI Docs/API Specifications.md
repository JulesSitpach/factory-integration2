Format:

OpenAPI 3.0 (Swagger) YAML or JSON ([Swagger]).

Example:

text
openapi: 3.0.0
info:
title: TradeNavigatorPro API
version: 1.0.0
paths:
/api/cost-calculator:
post:
summary: Calculate landed cost and tariffs
requestBody:
required: true
content:
multipart/form-data:
schema:
type: object
properties:
file:
type: string
format: binary
responses:
'200':
description: Calculation results
content:
application/json:
schema:
type: object
properties:
summary:
type: string
details:
type: array
items:
type: object
properties:
product_code: { type: string }
landed_cost: { type: number }
tariff: { type: number }
(Repeat for each endpoint: authentication, payments, supply chain, etc.)
