/**
 * YouTube verification provider interface.
 * A real provider can call the YouTube Data API to read channel descriptions.
 * Until keys exist, verification is submitted for admin review.
 */
export interface YouTubeVerificationProvider {
  checkDescriptionContains(channelUrl: string, code: string): Promise<boolean | null>;
}

export class PendingYouTubeVerificationProvider implements YouTubeVerificationProvider {
  async checkDescriptionContains(): Promise<boolean | null> {
    return null;
  }
}

export function getYouTubeVerificationProvider(): YouTubeVerificationProvider {
  return new PendingYouTubeVerificationProvider();
}
