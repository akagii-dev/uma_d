import {soundSrcQ, okeSrcQ, charQ, songQ, path} from "./sql.ts";

Deno.mkdir("./tmp")
Deno.mkdir("曲")
class Common {
    src: string[][];
    twoStrArray : string[] = [];
    song : string[][] = songQ;
    char : string[][] = charQ;
    constructor(src : string[][]) {
        this.src = src;
    }

    set settwoStrArray(_strArray: string[]) {
        for (let i = 0; i < this.src.length; i++) {
            let prop1 : string = this.src[i][1];
            _strArray.push(prop1.slice(0, 2))
            prop1 = path + "dat\\" + prop1.slice(0, 2) + "\\" + prop1;
            this.src[i][1] = prop1;
        }
        this.twoStrArray = _strArray;
    }

    async copyFile(){
        for (let i = 0; i < this.src.length; i++) {
            try {
               await Deno.mkdir("./tmp/" + this.twoStrArray[i]);
            } catch (_e) {
                //pass
            }
            await Deno.copyFile(this.src[i][1], this.src[i][1].replace(path + "dat", "./tmp") + ".awb");
            this.src[i][1] = this.src[i][1].replace(path + "dat", "./tmp") + ".awb";
        }
    }
}

const oke = new Common(okeSrcQ);
oke.settwoStrArray = [];
const char = new Common(soundSrcQ);
char.settwoStrArray = [];
await char.copyFile();
await oke.copyFile();

// extract
for (let i = 0; i < oke.src.length; i++) {
    await Deno.mkdir("./tmp/"+oke.src[i][0])
    await Deno.mkdir("曲"+"/"+oke.src[i][0])
    const p = Deno.run({
            cmd: ["vgmstream", "-o", `./tmp/${oke.src[i][0]}/${oke.src[i][0]}.wav`, oke.src[i][1]]
    })
    await p.status()
}

for (let i = 0; i < char.src.length; i++) {
    Deno.mkdir("./tmp/"+char.src[i][0].replace("_", "/"))
    let p = Deno.run({
        cmd: ["vgmstream","-o",`./tmp/${char.src[i][0].replace("_", "/")}/${char.src[i][0].split("_")[1]}_1.wav`,"-s","1",char.src[i][1]]
    })
    await p.status()
    p = Deno.run({
        cmd: ["vgmstream", "-o", `./tmp/${char.src[i][0].replace("_", "/")}/${char.src[i][0].split("_")[1]}_2.wav`, "-s", "2" ,char.src[i][1]]
    })
    await p.status()
}

//convert
for (let i = 0; i < char.src.length; i++) {
    const files = []
    for await(const file of Deno.readDir(`./tmp/${char.src[i][0].replace("_", "/")}`)){
        files.push(file.name)
    }
    if(files.length == 1){
        const p = Deno.run({
            cmd: ["sox", 
            "-m", 
            `./tmp/${char.src[i][0].split("_")[0]}/${char.src[i][0].split("_")[0]}.wav`, 
            `./tmp/${char.src[i][0].replace("_", "/")}/${char.src[i][0].split("_")[1]}_1.wav`,
            `./tmp/${char.src[i][0].split("_")[0]}/${char.src[i][0]}.wav`]
        })
        await p.status()
        Deno.run({
            cmd: ["sox", `./tmp/${char.src[i][0].split("_")[0]}/${char.src[i][0]}.wav`, `./曲/${char.src[i][0].split("_")[0]}/${char.src[i][0]}.mp3`]
        })
    } else {
        let p = Deno.run({
            cmd: ["sox", 
            "-m", 
            `./tmp/${char.src[i][0].split("_")[0]}/${char.src[i][0].split("_")[0]}.wav`, 
            `./tmp/${char.src[i][0].replace("_", "/")}/${char.src[i][0].split("_")[1]}_1.wav`,
            `./tmp/${char.src[i][0].replace("_", "/")}/${char.src[i][0].split("_")[1]}_3.wav`]
        })
        await p.status()
        p = Deno.run({
            cmd: ["sox", 
            "-m", 
            `./tmp/${char.src[i][0].replace("_", "/")}/${char.src[i][0].split("_")[1]}_2.wav`, 
            `./tmp/${char.src[i][0].replace("_", "/")}/${char.src[i][0].split("_")[1]}_3.wav`,
            `./tmp/${char.src[i][0].split("_")[0]}/${char.src[i][0]}.wav`]
        })
        await p.status()
        Deno.run({
            cmd: ["sox", `./tmp/${char.src[i][0].split("_")[0]}/${char.src[i][0]}.wav`, `./曲/${char.src[i][0].split("_")[0]}/${char.src[i][0]}.mp3`]
        })
    }
}

const checkArray : string[] = [];
for (let i = 0; i < oke.src.length; i++) {
    oke.src[i][1] = `./曲/${oke.src[i][0]}`;
    const files = []
    for await (const file of Deno.readDir(oke.src[i][1])) {
        files.push(file.name)
    }
    if (files.length == 0) {
        checkArray.push(oke.src[i][0]);
    }
}

// @ts-ignore : array
Deno.writeTextFile("./tmp/rest.txt", checkArray);
