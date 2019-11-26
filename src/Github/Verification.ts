type InvalidVerificationReason =
  | "expired_key"
  | "not_signing_key"
  | "gpgverify_error"
  | "gpgverify_unavailable"
  | "unsigned"
  | "unknown_signature_type"
  | "no_user"
  | "unverified_email"
  | "bad_email"
  | "unknown_key"
  | "invalid";

interface InvalidVerification {
  verified: false;
  reason: InvalidVerificationReason;
  signature: null;
  payload: null;
}

interface ValidVerification {
  verified: true;
  reason: "valid";
  signature: string;
  payload: string;
}

export type Verification = ValidVerification | InvalidVerification;
