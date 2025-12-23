import 'package:flutter_test/flutter_test.dart';
import 'package:inkup/home_screen.dart';
import 'package:inkup/main.dart';

void main() {
  testWidgets('Home screen smoke test', (WidgetTester tester) async {
    // Kick off the app and wait for it to settle.
    await tester.pumpWidget(const MyApp());

    // Check if the shop name showed up.
    expect(find.text('Printing Shop Name'), findsOneWidget);

    // Make sure the Bill Book option is on the screen.
    expect(find.text('Bill Book'), findsOneWidget);

    // Confirm the Home tab is sitting at the bottom.
    expect(find.text('Home'), findsOneWidget);
  });
}
