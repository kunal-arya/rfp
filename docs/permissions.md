# Permission Schema Documentation

This document outlines the structure of the JSON object used for defining role-based permissions and how the `hasPermission` middleware enforces them.

## Base Structure

The permissions object is organized by **resource** (e.g., `rfp`, `supplier_response`), with each resource containing a set of **actions** (e.g., `create`, `view`).

```json
{
  "resource_name": {
    "action_name": {
      "allowed": boolean,
      "...other_rules": "value"
    }
  }
}
```

The `hasPermission(resource, action)` middleware checks if the current user's role has the `allowed: true` flag for the given resource and action. It then applies any additional rules defined in the permission object.

---

## Permission Rules

The following rules can be combined to create fine-grained access control.

### `allowed`

-   **Type:** `boolean`
-   **Description:** The most basic rule. If `true`, the user is allowed to perform the action, subject to other rules. If `false` or undefined, access is denied.

### `scope`

-   **Type:** `string`
-   **Description:** Restricts access based on the user's relationship to the resource.
-   **Values:**
    -   `"own"`: The user must be the direct owner of the resource.
        -   For an `rfp`, the `buyer_id` must match the user's ID.
        -   For a `supplier_response`, the `supplier_id` must match the user's ID.
    -   `"rfp_owner"`: The user must be the owner of the parent RFP. This is used for actions on a `supplier_response` where the user is the buyer.
    -   `"published"`: The resource (specifically an `rfp`) must have a status of "Published".

### `allowed_rfp_statuses`

-   **Type:** `string[]` (Array of status codes)
-   **Description:** The action is only allowed if the target RFP's status is one of the statuses in the array.
-   **Example:** A supplier can only create a response for an RFP that is `Published`.

### `allowed_response_statuses`

-   **Type:** `string[]` (Array of status codes)
-   **Description:** The action is only allowed if the target supplier response's status is one of the statuses in the array.
-   **Example:** A supplier can only edit or submit a response that is in `Draft` status.

### `allowed_transitions`

-   **Type:** `object`
-   **Description:** Defines a state machine for status changes. The keys are the "from" statuses, and the values are arrays of allowed "to" statuses.
-   **Example:**
    ```json
    "allowed_transitions": {
      "Under_Review": ["Approved", "Rejected"]
    }
    ```
    This rule allows changing the status of a resource from `Under_Review` to either `Approved` or `Rejected`.

---

## Example: Buyer Role Permissions

```json
{
  "dashboard": { "view": true },
  "rfp": {
    "create": { "allowed": true },
    "view": { "allowed": true, "scope": "own" },
    "edit": { "allowed": true, "scope": "own", "allowed_rfp_statuses": ["Draft"] },
    "publish": { "allowed": true, "scope": "own", "allowed_rfp_statuses": ["Draft"] },
    "review_responses": { "allowed": true, "scope": "own" },
    "read_responses": { "allowed": true, "scope": "own" },
    "manage_documents": { "allowed": true, "scope": "own" },
    "change_status": {
      "allowed": true,
      "scope": "own",
      "allowed_transitions": {
        "Under_Review": ["Approved", "Rejected"]
      }
    }
  },
  "supplier_response": {
    "view": { "allowed": true, "scope": "rfp_owner" },
    "review": { "allowed": true, "scope": "rfp_owner" }
  },
  "documents": {
    "upload_for_rfp": { "allowed": true, "scope": "own" }
  },
  "search": { "allowed": true }
}
```

## Example: Supplier Role Permissions

```json
{
  "dashboard": { "view": true },
  "rfp": {
    "view": { "allowed": true, "scope": "published" }
  },
  "supplier_response": {
    "create": { "allowed": true, "allowed_rfp_statuses": ["Published"] },
    "submit": { "allowed": true, "scope": "own", "allowed_response_statuses": ["Draft"] },
    "view": { "allowed": true, "scope": "own" },
    "edit": { "allowed": true, "scope": "own", "allowed_response_statuses": ["Draft"] },
    "manage_documents": { "allowed": true, "scope": "own" }
  },
  "documents": {
    "upload_for_response": { "allowed": true, "scope": "own" }
  },
  "search": { "allowed": true }
}
```