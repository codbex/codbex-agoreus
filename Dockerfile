# Docker descriptor for codbex-agoreus
# License - http://www.eclipse.org/legal/epl-v20.html

FROM ghcr.io/codbex/codbex-gaia:0.23.0

COPY codbex-agoreus target/dirigible/repository/root/registry/public/codbex-agoreus

ENV DIRIGIBLE_HOME_URL=/services/web/codbex-agoreus/gen/index.html
