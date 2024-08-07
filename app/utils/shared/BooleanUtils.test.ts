import {describe, it, expect} from 'vitest'
import { BooleanFormats, BooleanFormatType } from './BooleanUtils';

describe('BooleanFormats', () => {
  describe('constants', () => {
    it('should contain 5 formats', () => {
      expect(BooleanFormats).toHaveLength(5);
    });
  });

  describe('values', () => {
    const validFormatValues: BooleanFormatType[] = [
      'yesNo',
      'trueFalse',
      'enabledDisabled',
      'onOff',
      'activeInactive'
    ];

    it.each(BooleanFormats.map((format) => [format.value, format.name]))(
      'should have valid values for %s (%s)',
      (value, name) => {
        expect(validFormatValues).toContain(value);
        expect(typeof name).toBe('string');
      },
    );
  });
});
