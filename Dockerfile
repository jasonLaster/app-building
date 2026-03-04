FROM node:22-bookworm

# System dependencies for Playwright browsers
RUN apt-get update && apt-get install -y \
    git \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
    libwayland-client0 \
    && rm -rf /var/lib/apt/lists/*

# Global npm packages
RUN npm install -g \
    @anthropic-ai/claude-code \
    netlify-cli \
    @replayio/replay \
    @replayio/playwright \
    tsx \
    typescript

# Install Playwright Chromium and Replay browser (globally accessible)
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/playwright
RUN npx playwright install --with-deps chromium
RUN npx replayio update

# Replay browser needs OpenSSL 1.1 to load its recording driver.
# Bookworm only has OpenSSL 3, so fetch the 1.1 libs from Ubuntu 18.04.
RUN curl -sL -o /tmp/libssl1.1.deb \
      http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1-1ubuntu2.1~18.04.23_amd64.deb && \
    dpkg-deb -x /tmp/libssl1.1.deb /opt/openssl11 && \
    rm /tmp/libssl1.1.deb
ENV LD_LIBRARY_PATH=/opt/openssl11/usr/lib/x86_64-linux-gnu

# Git identity for commits inside container (system-level so it works for any uid)
RUN git config --system user.name "App Builder" && \
    git config --system user.email "app-builder@localhost"

# Create non-root user (claude code refuses --dangerously-skip-permissions as root)
RUN useradd -m -s /bin/bash agent && \
    mkdir -p /repo && chown agent:agent /repo
USER agent

# Copy app scripts and source
WORKDIR /app-building
COPY --chown=agent:agent package.json .env.example ./
RUN npm install --production
COPY --chown=agent:agent src/ ./src/
COPY --chown=agent:agent scripts/ ./scripts/

EXPOSE 3000
CMD ["npx", "tsx", "/app-building/src/server.ts"]
