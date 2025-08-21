# Permission Schema

This document outlines the structure of the JSON object used for defining role-based permissions.

## Base Structure

The permissions object is organized by resource (e.g., `rfp`, `dashboard`), with each resource containing a set of actions (e.g., `create`, `view`).

## Buyer Role Permissions

```json
{
  "dashboard": {
    "view": true
  },
  "rfp": {
    "create": { "allowed": true },
    "view": { "allowed": true, "scope": "own" },
    "edit": { "allowed": true, "scope": "own", "allowed_statuses": ["Draft"] },
    "publish": { "allowed": true, "scope": "own", "allowed_statuses": ["Draft"] },
    "review_responses": { "allowed": true, "scope": "own" },
    "change_status": { "allowed": true, "scope": "own", "allowed_transitions": { "Under_Review": ["Approved", "Rejected"] } }
  },
  "supplier_response": {
    "submit": { "allowed": false },
    "view": { "allowed": true, "scope": "rfp_owner" },
    "edit": { "allowed": false }
  },
  "documents": {
    "upload_for_rfp": { "allowed": true, "scope": "own" },
    "upload_for_response": { "allowed": false }
  },
  "search": {
    "allowed": true
  },
  "admin": {
    "manage_users": false,
    "manage_roles": false
  }
}
```

## Supplier Role Permissions

```json
{
  "dashboard": {
    "view": true
  },
  "rfp": {
    "create": { "allowed": false },
    "view": { "allowed": true, "scope": "published" },
    "edit": { "allowed": false },
    "publish": { "allowed": false },
    "review_responses": { "allowed": false },
    "change_status": { "allowed": false }
  },
  "supplier_response": {
    "submit": { "allowed": true, "allowed_rfp_statuses": ["Published"] },
    "view": { "allowed": true, "scope": "own" },
    "edit": { "allowed": true, "scope": "own", "allowed_rfp_statuses": ["Draft"] }
  },
  "documents": {
    "upload_for_rfp": { "allowed": false },
    "upload_for_response": { "allowed": true, "scope": "own" }
  },
  "search": {
    "allowed": true
  },
  "admin": {
    "manage_users": false,
    "manage_roles": false
  }
}
```
