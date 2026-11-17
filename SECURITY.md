# Security policy

## Reporting a vulnerability

Report it through GitHub's [private vulnerability reporting](https://github.com/TecFancy/dsh-lingualab/security/advisories/new)
rather than a public issue. That channel is private between you and the maintainer.

Please include what the problem is, how to reproduce it, and what an attacker gains.
Expect an acknowledgement within seven days.

## Scope

LinguaLab runs inside a DeepSeek Harness host and serves the media library that host
can already read. The interesting surface is therefore the HTTP routes it registers:
they are answered only for a request the host admits (a loopback `Host`, a matching
`Origin`, the signed session cookie), and `docs/host-routes.md` lists every one of them
with what it answers.

A report that a route answers a request the host would not have admitted is a
vulnerability. So is a path that escapes the configured library root, or a write that
lands outside the files the plugin owns.
