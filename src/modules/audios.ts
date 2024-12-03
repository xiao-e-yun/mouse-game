export class AudioManager {
    public context = new AudioContext();
    public gainNode = this.context.createGain();
    public buffers: Map<string, AudioBuffer> = new Map();

    async load(name: string, url: string) {
        const buffer = await fetch(url)
            .then(response => response.arrayBuffer())
            .then(buffer => this.context.decodeAudioData(buffer))

        this.buffers.set(name, buffer);
        return buffer;
    }

    get(name: string) {
        const buffers = this.buffers.get(name)
        if (!buffers) throw new Error(`Audio ${name} not found`)

        const source = this.context.createBufferSource();
        source.buffer = buffers;
        source
            .connect(this.gainNode)
            .connect(this.context.destination);
        return source;
    }

    play(name: string) {
        const source = this.get(name);
        source.start();
        return source;
    }

    setVolume(value: number) {
        this.gainNode.gain.value = value;
    }
}

export const audioManager = new AudioManager();