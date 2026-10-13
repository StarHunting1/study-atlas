#!/usr/bin/env bash
# Completes TLS chains for hosts whose server omits the intermediate certificate (browsers fetch it via the
# certificate's "CA Issuers" AIA URL; Node does not). TLS verification stays ON: the downloaded intermediate is
# only used if `openssl verify` proves it is issued by a root in the system trust store.
# Usage: collector/aia-chain.sh <out.pem> host [host...]   → then export NODE_EXTRA_CA_CERTS=<out.pem>
set -uo pipefail
out="$1"; shift; : > "$out"
tmp=$(mktemp -d)
for host in "$@"; do
  leaf="$tmp/$host.leaf.pem"
  if ! openssl s_client -connect "$host:443" -servername "$host" </dev/null 2>/dev/null | openssl x509 > "$leaf" 2>/dev/null; then echo "aia: $host: no certificate"; continue; fi
  url=$(openssl x509 -in "$leaf" -noout -ext authorityInfoAccess 2>/dev/null | sed -n 's/.*CA Issuers - URI:\(.*\)/\1/p' | head -1)
  [ -z "$url" ] && { echo "aia: $host: no CA Issuers URL"; continue; }
  der="$tmp/$host.issuer"; curl -fsSL --max-time 20 "$url" -o "$der" || { echo "aia: $host: download failed"; continue; }
  pem="$tmp/$host.issuer.pem"
  openssl x509 -inform DER -in "$der" -out "$pem" 2>/dev/null || openssl x509 -in "$der" -out "$pem" 2>/dev/null || { echo "aia: $host: not a certificate"; continue; }
  # The intermediate must chain to a system root, and must have issued the leaf
  if openssl verify "$pem" >/dev/null 2>&1 && openssl verify -untrusted "$pem" "$leaf" >/dev/null 2>&1; then
    cat "$pem" >> "$out"; echo "aia: $host: added issuer $(openssl x509 -in "$pem" -noout -subject)"
  else echo "aia: $host: issuer did not verify against system roots (not used)"; fi
done
rm -rf "$tmp"
