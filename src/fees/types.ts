export abstract class RegionFee {
  processForEmployee(_config: unknown): {
    totalFee: number;
    feeBreakdown: { name: string; amount: number; description: string }[];
  } & Record<string, unknown> {
    throw new Error('method not implemented');
  }
}
