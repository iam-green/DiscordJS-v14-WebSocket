export class Discord {
  static async getClientIds(): Promise<string[]> {
    if (!process.env.DISCORD_TEAM_ID) throw new Error('No Discord Team ID');
    if (!process.env.DISCORD_USER_TOKEN)
      throw new Error('No Discord User Token');
    return (
      await (
        await fetch(
          `https://discord.com/api/v10/teams/${process.env.DISCORD_TEAM_ID}/applications`,
          { headers: { Authorization: process.env.DISCORD_USER_TOKEN } },
        )
      ).json()
    ).map((v) => v.id);
  }
}
