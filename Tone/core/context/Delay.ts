import { Param } from "../context/Param";
import { Time } from "../type/Units";
import { optionsFromArguments } from "../util/Defaults";
import { readOnly } from "../util/Interface";
import { ToneAudioNode, ToneAudioNodeOptions } from "./ToneAudioNode";

export interface DelayOptions extends ToneAudioNodeOptions {
	delayTime: Time;
	maxDelay: Time;
}

/**
 *  Wrapper around Web Audio's native [DelayNode](http://webaudio.github.io/web-audio-api/#the-delaynode-interface).
 *  @param delayTime The delay applied to the incoming signal.
 *  @param maxDelay The maximum delay time.
 */
export class Delay extends ToneAudioNode<DelayOptions> {

	readonly name = "Delay";

	/**
	 * The maximum delay time. This cannot be changed after
	 * the value is passed into the constructor.
	 */
	readonly maxDelay: Time;

	/**
	 *  The amount of time the incoming signal is delayed.
	 */
	readonly delayTime: Param<Time>;

	/**
	 * Private reference to the internal DelayNode
	 */
	private _delayNode: DelayNode;
	readonly input: DelayNode;
	readonly output: DelayNode;

	constructor(options?: Partial<DelayOptions>)
	constructor(delayTime?: Time, maxDelay?: Time)
	constructor() {
		super(optionsFromArguments(Delay.getDefaults(), arguments, ["delayTime", "maxDelay"]));

		const options = optionsFromArguments(Delay.getDefaults(), arguments, ["delayTime", "maxDelay"]);

		const maxDelayInSeconds = this.toSeconds(options.maxDelay);
		this.maxDelay = Math.max(maxDelayInSeconds, this.toSeconds(options.delayTime));

		this._delayNode = this.input = this.output = this.context.createDelay(maxDelayInSeconds);
		this._internalChannels = [this._delayNode];

		this.delayTime = new Param({
			context: this.context,
			param : this._delayNode.delayTime,
			units : "time",
			value : options.delayTime,
		});

		readOnly(this, "delayTime");
	}

	static getDefaults(): DelayOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			delayTime : 0,
			maxDelay: 1,
		});
	}

	/**
	 *  Clean up.
	 */
	dispose(): this {
		super.dispose();
		this._delayNode.disconnect();
		this.delayTime.dispose();
		return this;
	}
}
