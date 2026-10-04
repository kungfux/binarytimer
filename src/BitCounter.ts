class BitCounter {
  private static readonly BITS_PER_GROUP = 4;
  private static readonly MAX_GROUPS = 9;
  private static readonly MAX_BITS =
    BitCounter.BITS_PER_GROUP * BitCounter.MAX_GROUPS;
  private static readonly MAX_TIME = 2 ** BitCounter.MAX_BITS - 1;

  private static bits = Array(BitCounter.BITS_PER_GROUP).fill(0);
  private static usedGroups = [false];

  public getMaximumBits(): number {
    return BitCounter.bits.length;
  }

  public getBits(): number[] {
    return [...BitCounter.bits];
  }

  public getTime(): number {
    return this.getBits().reduce((acc, bit, index) => {
      return acc + bit * Math.pow(2, index);
    }, 0);
  }

  public setTime(seconds: number): number[] {
    const secondsToAdd = BitCounter.normalizeTime(seconds);
    const binaryTime = secondsToAdd.toString(2);
    const bitCount = BitCounter.getRequiredBitCount(binaryTime);

    BitCounter.bits = binaryTime
      .padStart(bitCount, "0")
      .split("")
      .map(Number)
      .reverse();
    BitCounter.usedGroups = Array.from(
      { length: bitCount / BitCounter.BITS_PER_GROUP },
      (_, index) =>
        BitCounter.bits
          .slice(
            index * BitCounter.BITS_PER_GROUP,
            (index + 1) * BitCounter.BITS_PER_GROUP,
          )
          .some((bit) => bit === 1),
    );
    return this.getBits();
  }

  public addTime(seconds: number): number[] {
    return this.updateTime(this.getTime() + seconds, false);
  }

  public reduceTime(seconds: number): number[] {
    return this.updateTime(this.getTime() - seconds, true);
  }

  public reverseBit(index: number): number[] {
    if (index < 0 || index >= BitCounter.bits.length) {
      return this.getBits();
    }
    const bitChange = BitCounter.bits[index] === 1 ? -1 : 1;
    return this.updateTime(
      this.getTime() + bitChange * 2 ** index,
      true,
    );
  }

  private updateTime(seconds: number, removeEmptyGroups: boolean): number[] {
    const normalizedTime = BitCounter.normalizeTime(seconds);
    const binaryTime = normalizedTime.toString(2);
    const bitCount = Math.max(
      BitCounter.bits.length,
      BitCounter.getRequiredBitCount(binaryTime),
    );
    const nextBits = binaryTime
      .padStart(bitCount, "0")
      .split("")
      .map(Number)
      .reverse();
    const nextUsedGroups = [...BitCounter.usedGroups];

    while (nextUsedGroups.length < bitCount / BitCounter.BITS_PER_GROUP) {
      nextUsedGroups.push(false);
    }

    nextBits.forEach((bit, index) => {
      if (bit === 1) {
        nextUsedGroups[Math.floor(index / BitCounter.BITS_PER_GROUP)] = true;
      }
    });

    if (removeEmptyGroups) {
      const hasClearedMajorBit = nextBits.some(
        (bit, index) =>
          index % BitCounter.BITS_PER_GROUP === BitCounter.BITS_PER_GROUP - 1 &&
          BitCounter.bits[index] === 1 &&
          bit === 0,
      );
      const hasClearedGroup = nextUsedGroups.some((wasUsed, groupIndex) => {
        const groupStart = groupIndex * BitCounter.BITS_PER_GROUP;
        return (
          wasUsed &&
          nextBits
          .slice(groupStart, groupStart + BitCounter.BITS_PER_GROUP)
            .every((bit) => bit === 0)
        );
      });

      if (hasClearedMajorBit || hasClearedGroup) {
        const groupCount =
          BitCounter.getRequiredBitCount(binaryTime) / BitCounter.BITS_PER_GROUP;
        nextBits.length = groupCount * BitCounter.BITS_PER_GROUP;
        nextUsedGroups.length = groupCount;
      }
    }

    BitCounter.bits = nextBits;
    BitCounter.usedGroups = nextUsedGroups;
    return this.getBits();
  }

  private static normalizeTime(seconds: number): number {
    return Number.isFinite(seconds)
      ? Math.min(BitCounter.MAX_TIME, Math.max(0, Math.floor(seconds)))
      : 0;
  }

  private static getRequiredBitCount(binaryTime: string): number {
    const bitCount = Math.max(
      BitCounter.BITS_PER_GROUP,
      Math.ceil(binaryTime.length / BitCounter.BITS_PER_GROUP) *
        BitCounter.BITS_PER_GROUP,
    );

    const requiredBitCount =
      binaryTime.length === bitCount && binaryTime[0] === "1"
        ? bitCount + BitCounter.BITS_PER_GROUP
        : bitCount;

    return Math.min(BitCounter.MAX_BITS, requiredBitCount);
  }

  public toString(isStopwatchMode: boolean): string {
    const time = this.getTime();

    if (time === 0) {
      return isStopwatchMode ? "0 seconds" : "Time's up!";
    }

    const days = Math.floor(time / 86400);
    const hours = Math.floor((time % 86400) / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    const daysText = days > 0 ? `${days} day${days !== 1 ? "s" : ""}` : "";
    const hoursText = hours > 0 ? `${hours} hour${hours !== 1 ? "s" : ""}` : "";
    const minutesText =
      minutes > 0 ? `${minutes} minute${minutes !== 1 ? "s" : ""}` : "";
    const secondsText =
      seconds > 0 ? `${seconds} second${seconds !== 1 ? "s" : ""}` : "";

    return [daysText, hoursText, minutesText, secondsText]
      .filter(Boolean)
      .join(" ");
  }
}

export default BitCounter;
