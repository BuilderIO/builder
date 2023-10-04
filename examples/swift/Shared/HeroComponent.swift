import SwiftUI
import BuilderIO

struct HeroComponent: View {
    var headingText: String;
    var detailText: String;
    var ctaText: String;
    var image: String;
   
   var body: some View {
       VStack {
           BackportAsyncImage(url: URL(string: image), scale: 1) { phase in
               if let image = phase.image {
                   image
                       .resizable()
                       .aspectRatio(contentMode: .fit)
                       .frame(minWidth: 0, idealWidth: .infinity, maxWidth: .infinity)
               } else if phase.error != nil {
                   Color.red
               } else {
                   Color.blue
               }
           }.padding(20)
               .cornerRadius(20)
           
           Text(headingText)
               .font(.system(size: 25).weight(Font.Weight.heavy))
               .multilineTextAlignment(.center)
               .frame(maxWidth: .infinity, alignment: .center)
               .foregroundColor(.white)
               .textCase(.uppercase)
               .padding(.bottom, 10)
           
           Text(detailText)
               .font(.system(size: 12))
               
               .multilineTextAlignment(.center)
               .frame(maxWidth: .infinity, alignment: .center)
               .foregroundColor(.white)
           
           
           Button(action: {
               print("Button tapped");
           }, label: {
               Text(ctaText)
                   .font(.system(size: 12).weight(Font.Weight.medium))
                   .foregroundColor(Color(red: 27/256, green: 27/256, blue: 27/256))
                   .padding(5)
               
           })
           .foregroundColor(.white)
           // CAEA03
           .padding(5)
           .background(Color(red: 202/256, green: 234/256, blue: 3/256))
           .padding(10)
           .multilineTextAlignment(.center)
           .frame(maxWidth: .infinity, alignment: .center)
           
       }.background(.black)
   }
}

struct HeroComponent_Previews: PreviewProvider {
    static var previews: some View {
        HeroComponent(
            headingText: "Default Heading",
            detailText: "I am detail text",
            ctaText: "Default CTA Text",
            image: "https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a"
        )    }
}
