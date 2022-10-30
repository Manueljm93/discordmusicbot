const {SlashCommandBuilder} = require("@discordjs/builders")
const {MessageEmbed } = require("discord.js")
const {QueryType } = require("discord-player")
module.exports ={
    data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("load songs from utube")
    .addSubcommand((subcommand)=>
        subcommand.setName("song")
        .setDescription("Loads a single song from a url")
        .addStringOption((option) => option.setName("url").setDescription("The songs url's").setRequired(true))
        )
    .addSubcommand((subcommand) => 
        subcommand
        .setName("playlist")
        .setDescription("Loads a playlist of songs from a url")
        .addStringOption((option) => option.setName("url").setDescription("the playlist's url").setRequired(true))
    )
    .addSubcommand((subcommand)=>
        subcommand.setName("search").setDescription("Searches for song on provided keywords")
        .addStringOption((option) => option.setName("searchterms").setDescription("the search keyword").setRequired(true))
    ),
    run: async({client, interaction}) => {
        if(!interaction.member.voice.channel)
        return interaction.editReply("You need to be in a VC to use this commands")

        const queue = await client.player.createQueu(interaction.guild)
        if(!queue.connection) await queue.connect(interaction.member.voice.channel)

        let embed = new MessageEmbed()
        
        if(interaction.option.getSubCommand() == "song"){
            let url = interaction.option.getString("url")
            const result = await client.player.search(url, {
                requestBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            })
            if(result.tracks.length === 0)
            return interaction.editReply("No Results")
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
            .setDescription(`**[${song.title}](${song.url})**`)
            .setThumbnail(song.thumbnail)
            .setFooter({text: `Duration: ${song.duration}`})
        } else if (interaction.option.getSubCommand() == "playlist"){
            let url = interaction.option.getString("url")
            const result = await client.player.search(url, {
                requestBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
            })
            if(result.tracks.length === 0)
            return interaction.editReply("No Results")
            const playlist = result.playlist
            await queue.addTracks(result.tracks)
            embed
            .setDescription(`**${result.tracks.playlist.length} songs from [${playlist.title}](${playlist.url})**`)
            .setThumbnail(playlist.thumbnail)            
        } else if (interaction.option.getSubCommand() == "search"){
            let url = interaction.option.getString("searchterms")
            const result = await client.player.search(url, {
                requestBy: interaction.user,
                searchEngine: QueryType.AUTO
            })
            if(result.tracks.length === 0)
            return interaction.editReply("No Results")
            const song = result.tracks[0]
            await queue.addTracks(result.song)
            embed
            .setDescription(`**[${song.title}](${song.url})**`)
            .setThumbnail(song.thumbnail)
            .setFooter({text: `Duration: ${song.duration}`})    
        }
        if(!queue.player) await queue.play()
        await interaction.editReply({
            embeds: [embed]
        })
    },
    

}