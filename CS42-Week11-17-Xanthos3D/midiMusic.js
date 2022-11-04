// audio script that contains musics and sound effects.
//https://tonejs.github.io/examples/
//starts audio playback of any midi file.
function midiStart(){
//to work with tone.js then we first call its start method
Tone.start();
//set 2. tone.js is a audio work station (daw) with synths built in
//want to define programatically 2 instruments.

let synth1 = new Tone.Synth().toDestination();
let synth2 = new Tone.MonoSynth().toDestination();
let synth3 = new Tone.FMSynth().toDestination();
let synth4 = new Tone.AMSynth().toDestination();
let synth5 = new Tone.PolySynth().toDestination();
let synth6 = new Tone.FatOscillator().toDestination();
let synth7 = new Tone.MetalSynth().toDestination();

//step 3 call midi convert to load our external midi file
    MidiConvert.load(
    //load takes two arguments
    //first is a path to the midi file
    'assets/piano.mid',
    //the second is a function we want to run after the file loads.
    function(midiData){
    console.log("midi loaded and in json", midiData);

        Tone.Transport.bpm.value = midiData.header.bpm;

            let midiPart1 = new Tone.Part(
                    function(time,note){

                        synth1.triggerAttackRelease(
                            note.midi,
                            note.duration,
                            time,
                            note.velocity
                        );

                    },
                    midiData.tracks[1].notes
            );

           /* let midiPart2 = new Tone.Part(
                function(time,note){

                    synth5.triggerAttackRelease(
                        note.midi,
                        note.duration,
                        time,
                        note.velocity
                    );

                },
                midiData.tracks[5].notes
        );

        let midiPart3 = new Tone.Part(
            function(time,note){

                synth1.triggerAttackRelease(
                    note.midi,
                    note.duration,
                    time,
                    note.velocity
                );

            },
            midiData.tracks[6].notes
        );

        let midiPart4 = new Tone.Part(
            function(time,note){

                synth1.triggerAttackRelease(
                    note.midi,
                    note.duration,
                    time,
                    note.velocity
                );

            },
            midiData.tracks[8].notes
        );

        let midiPart5 = new Tone.Part(
            function(time,note){

                synth6.triggerAttackRelease(
                    note.midi,
                    note.duration,
                    time,
                    note.velocity
                );

            },
            midiData.tracks[9].notes
        );

        let midiPart6 = new Tone.Part(
            function(time,note){

                synth6.triggerAttackRelease(
                    note.midi,
                    note.duration,
                    time,
                    note.velocity
                );

            },
            midiData.tracks[10].notes
        );
            */

            //tell tine to play back this part as soon as the transport starts
            midiPart1.start();
            /*midiPart2.start();
            midiPart3.start();
            midiPart4.start();
            midiPart5.start();
            midiPart6.start();*/
            //starts the transport object to hear events
            Tone.Transport.start();
        }

    );

}