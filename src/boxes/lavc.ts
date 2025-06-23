/*
 * Copyright (c) 2025. Paul Higgs
 * License: BSD-3-Clause (see LICENSE file)
 */
// LAVS3 configuration box (layered AVS3 video)

import { Box } from '#/box';
import { MP4BoxStream } from '#/stream';
import { BinaryValue } from './avs-common';

import { Log } from '#/log';

class AVS3TemporalLayer {
  temporal_layer_id: number;
  frame_rate_code: BinaryValue;
  temporal_bit_rate_lower: number;
  temporal_bit_rate_upper: number;

  constructor(
    _temporal_layer_id: number,
    _frame_rate_code: number,
    _temporal_bit_rate_lower: number,
    _temporal_bit_rate_upper: number,
  ) {
    this.temporal_layer_id = _temporal_layer_id;
    this.frame_rate_code = new BinaryValue(_frame_rate_code, 3);
    this.temporal_bit_rate_lower = _temporal_bit_rate_lower;
    this.temporal_bit_rate_upper = _temporal_bit_rate_upper;
  }
  toString() {
    return (
      '{temporal_layer_id:' +
      this.temporal_layer_id +
      ', frame_rate_code:' +
      this.frame_rate_code.toString() +
      ', temporal_bit_rate_lower:' +
      this.temporal_bit_rate_lower +
      ', temporal_bit_rate_upper:' +
      this.temporal_bit_rate_upper +
      '}'
    );
  }
}
class AVS3TemporalLayers {
  layers: Array<AVS3TemporalLayer>;

  constructor() {
    this.layers = [];
  }
  push(layer: AVS3TemporalLayer) {
    this.layers.push(layer);
  }
  toString() {
    const l = [];
    this.layers.forEach(layer => {
      l.push(layer.toString());
    });
    return l.join(', ');
  }
}

export class lavcBox extends Box {
  static override readonly fourcc = 'lavc' as const;
  box_name = 'LAvs3ConfigurationBox' as const;

  configurationVersion: number;
  numTemporalLayers?: number;
  layers: AVS3TemporalLayers;

  parse(stream: MP4BoxStream) {
    this.configurationVersion = stream.readUint8();
    if (this.configurationVersion !== 1) {
      Log.error('lavc version ' + this.configurationVersion + ' not supported');
      return;
    }
    this.numTemporalLayers = stream.readUint8();
    this.layers = new AVS3TemporalLayers();
    for (let i = 0; i < this.numTemporalLayers; i++) {
      const tmp_val1 = stream.readUint8();
      const tmp_val2 = stream.readUint32();

      this.layers.push(
        new AVS3TemporalLayer(
          (tmp_val1 >> 5) & 0x07,
          (tmp_val1 >> 1) & 0x0f,
          (tmp_val2 >> 14) & 0x0003ffff,
          (tmp_val2 >> 2) & 0x00000fff,
        ),
      );
    }
  }
}
